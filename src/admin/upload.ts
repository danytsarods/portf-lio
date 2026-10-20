import { Upload } from 'tus-js-client'
import { MEDIA_BUCKET, SUPABASE_KEY, SUPABASE_URL } from '../lib/supabase-config'
import { media, supabase } from './supabase'

/** Acima deste tamanho o envio é feito em partes de 6 MB, com retomada automática. */
const RESUMABLE_FROM = 6 * 1024 * 1024

// Endereço direto do Storage (recomendado pelo Supabase para arquivos grandes)
const resumableEndpoint = `${SUPABASE_URL.replace('.supabase.co', '.storage.supabase.co')}/storage/v1/upload/resumable`

export type Progress = (sent: number, total: number) => void

/** Envia um arquivo para o bucket de mídias e devolve a URL pública. */
export async function uploadMedia(path: string, blob: Blob, contentType: string, onProgress?: Progress) {
  if (blob.size <= RESUMABLE_FROM) {
    const { error } = await media().upload(path, blob, { contentType, cacheControl: '31536000', upsert: false })
    if (error) throw error
  } else {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw new Error('Sua sessão expirou. Entre de novo no painel.')
    const token = data.session.access_token
    await new Promise<void>((resolve, reject) => {
      const upload = new Upload(blob, {
        endpoint: resumableEndpoint,
        retryDelays: [0, 2000, 5000, 10000, 20000, 30000, 60000],
        headers: { authorization: `Bearer ${token}`, apikey: SUPABASE_KEY, 'x-upsert': 'false' },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024, // valor exigido pelo Supabase
        metadata: { bucketName: MEDIA_BUCKET, objectName: path, contentType, cacheControl: '31536000' },
        onProgress: (sent, total) => onProgress?.(sent, total),
        onError: (err) => reject(new Error(tusMessage(err))),
        onSuccess: () => resolve(),
      })
      // retoma um envio interrompido do mesmo arquivo, se houver
      upload.findPreviousUploads().then((previous) => {
        if (previous.length) upload.resumeFromPreviousUpload(previous[0])
        upload.start()
      })
    })
  }
  return media().getPublicUrl(path).data.publicUrl
}

function tusMessage(err: Error) {
  const body =
    'originalResponse' in err
      ? String((err as { originalResponse?: { getBody(): string } }).originalResponse?.getBody() ?? '')
      : ''
  if (/maximum allowed size|too large|413/i.test(body + err.message))
    return 'O arquivo passa do limite do armazenamento. No plano gratuito do Supabase o máximo é 50 MB por arquivo; para enviar arquivos de até 1 GB é preciso o plano Pro (veja o README).'
  return body || err.message
}
