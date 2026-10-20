import { useCallback, useEffect, useRef, useState } from 'react'
import { photoCategories, videoCategories, type Category, type CategoryKind } from '../content/categories'
import { importedPhotoWorks, importedVideoWorks, type UploadedWork, type WorkOverrides } from '../content/works'
import { errorMessage, loadContent, media, saveContent, supabase } from './supabase'
import { extensionOf, MAX_UPLOAD_BYTES, prepareVideo, preparePhoto } from './media'
import { uploadMedia } from './upload'
import { IconButton, inputClass, StatusLine, type Status } from './ui'

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(0)} MB`

const randomId = () => Math.random().toString(36).slice(2, 8)

export function WorksPanel() {
  const [kind, setKind] = useState<CategoryKind>('videos')
  const categories = kind === 'videos' ? videoCategories : photoCategories
  const [slug, setSlug] = useState(categories[0].slug)
  const category = categories.find((c) => c.slug === slug) ?? categories[0]

  const [works, setWorks] = useState<UploadedWork[]>([])
  const [overrides, setOverrides] = useState<WorkOverrides>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const reload = useCallback(async () => {
    const [{ data, error }, content] = await Promise.all([
      supabase.from('works').select('*').order('position'),
      loadContent(),
    ])
    if (error) throw error
    setWorks(data as UploadedWork[])
    setOverrides(content.work_overrides ?? {})
  }, [])

  useEffect(() => {
    reload().catch((err) => setStatus({ kind: 'error', message: errorMessage(err) }))
  }, [reload])

  // avisa antes de fechar a aba no meio de um envio
  const busy = status.kind === 'busy'
  useEffect(() => {
    if (!busy) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [busy])

  const switchKind = (k: CategoryKind) => {
    setKind(k)
    setSlug((k === 'videos' ? videoCategories : photoCategories)[0].slug)
  }

  const workKind = kind === 'videos' ? 'video' : 'photo'
  const mine = works.filter((w) => w.kind === workKind && w.category === category.slug)

  const run = async (
    busy: string,
    task: () => Promise<void>,
    done = 'Pronto! Já aparece no site ao recarregar a página.',
  ) => {
    setStatus({ kind: 'busy', message: busy })
    try {
      await task()
      await reload()
      setStatus({ kind: 'ok', message: done })
    } catch (err) {
      setStatus({ kind: 'error', message: errorMessage(err) })
      await reload().catch(() => {})
    }
  }

  const onFiles = (files: File[]) =>
    run(
      `Preparando ${files.length} arquivo(s)…`,
      async () => {
        // novos envios entram no topo da categoria, na ordem em que foram escolhidos
        let position = Math.min(0, ...mine.map((w) => w.position)) - files.length
        for (const [i, file] of files.entries()) {
          const label = `Enviando ${i + 1} de ${files.length}: ${file.name}`
          setStatus({ kind: 'busy', message: `${label}…` })
          const progress = (sent: number, total: number) =>
            setStatus({
              kind: 'busy',
              message: `${label} — ${Math.floor((sent / total) * 100)}% (${mb(sent)} de ${mb(total)}). Não feche esta página.`,
            })
          const upload = (path: string, blob: Blob, type: string) => uploadMedia(path, blob, type, progress)
          const base = `${kind}/${category.slug}/${Date.now()}-${randomId()}`
          if (workKind === 'photo') {
            const { large, small } = await preparePhoto(file)
            const src = await upload(`${base}.jpg`, large.blob, 'image/jpeg')
            const smallUrl = small ? await upload(`${base}-1200.jpg`, small.blob, 'image/jpeg') : null
            const { error } = await supabase.from('works').insert({
              kind: 'photo',
              category: category.slug,
              src,
              small: smallUrl,
              small_width: small?.width ?? null,
              width: large.width,
              height: large.height,
              storage_paths: [`${base}.jpg`, ...(small ? [`${base}-1200.jpg`] : [])],
              position: position++,
            })
            if (error) throw error
          } else {
            const meta = await prepareVideo(file)
            const ext = extensionOf(file)
            const src = await upload(`${base}.${ext}`, file, file.type || 'video/mp4')
            const poster = meta.poster ? await upload(`${base}-capa.jpg`, meta.poster.blob, 'image/jpeg') : null
            const { error } = await supabase.from('works').insert({
              kind: 'video',
              category: category.slug,
              title: file.name
                .replace(/\.[^.]+$/, '')
                .replace(/[-_]+/g, ' ')
                .trim(),
              src,
              poster,
              width: meta.width,
              height: meta.height,
              duration_seconds: Math.round(meta.duration * 10) / 10,
              storage_paths: [`${base}.${ext}`, ...(poster ? [`${base}-capa.jpg`] : [])],
              position: position++,
            })
            if (error) throw error
          }
        }
      },
      `${files.length} arquivo(s) enviado(s)! Já aparece(m) no site ao recarregar a página.`,
    )

  const update = (w: UploadedWork, patch: Partial<UploadedWork>) =>
    run(
      'Salvando…',
      async () => {
        const { error } = await supabase.from('works').update(patch).eq('id', w.id)
        if (error) throw error
      },
      'Salvo!',
    )

  const remove = (w: UploadedWork) => {
    if (!confirm('Excluir este trabalho do site? O arquivo também será apagado.')) return
    run(
      'Excluindo…',
      async () => {
        if (w.storage_paths.length) await media().remove(w.storage_paths)
        const { error } = await supabase.from('works').delete().eq('id', w.id)
        if (error) throw error
      },
      'Excluído.',
    )
  }

  const move = (i: number, d: number) =>
    run(
      'Reordenando…',
      async () => {
        const order = [...mine]
        ;[order[i], order[i + d]] = [order[i + d], order[i]]
        const results = await Promise.all(
          order.map((w, position) => supabase.from('works').update({ position }).eq('id', w.id)),
        )
        const failed = results.find((r) => r.error)
        if (failed) throw failed.error
      },
      'Ordem atualizada.',
    )

  const replacePoster = (w: UploadedWork, file: File) =>
    run(
      'Enviando a capa…',
      async () => {
        const { large } = await preparePhoto(file)
        const path = `${kind}/${category.slug}/${Date.now()}-${randomId()}-capa.jpg`
        const poster = await uploadMedia(path, large.blob, 'image/jpeg')
        const old = w.storage_paths.filter((p) => p.endsWith('-capa.jpg'))
        const { error } = await supabase
          .from('works')
          .update({ poster, storage_paths: [...w.storage_paths.filter((p) => !old.includes(p)), path] })
          .eq('id', w.id)
        if (error) throw error
        if (old.length) await media().remove(old)
      },
      'Capa atualizada!',
    )

  const setOverride = (id: string, patch: WorkOverrides[string]) =>
    run(
      'Salvando…',
      async () => {
        const next = { ...overrides, [id]: { ...overrides[id], ...patch } }
        await saveContent('work_overrides', next)
      },
      'Salvo!',
    )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {(['videos', 'fotografia'] as const).map((k) => (
          <Chip key={k} active={kind === k} onClick={() => switchKind(k)}>
            {k === 'videos' ? 'Vídeos' : 'Fotografia'}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Chip key={c.slug} small active={c.slug === category.slug} onClick={() => setSlug(c.slug)}>
            {c.title}
          </Chip>
        ))}
      </div>

      <UploadBox kind={kind} category={category} onFiles={onFiles} busy={status.kind === 'busy'} />
      <div aria-live="polite">
        <StatusLine status={status} />
      </div>

      <section>
        <h3 className="text-sm font-semibold">Enviados pelo painel ({mine.length})</h3>
        <p className="text-mute mt-1 text-xs">Aparecem primeiro na página, nesta ordem.</p>
        {mine.length === 0 ? (
          <p className="text-mute mt-4 rounded-xl border border-dashed border-white/15 p-6 text-sm">
            Nenhum trabalho enviado nesta categoria ainda.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mine.map((w, i) => (
              <UploadedRow
                key={w.id}
                work={w}
                first={i === 0}
                last={i === mine.length - 1}
                onMove={(d) => move(i, d)}
                onUpdate={(patch) => update(w, patch)}
                onRemove={() => remove(w)}
                onPoster={(f) => replacePoster(w, f)}
              />
            ))}
          </ul>
        )}
      </section>

      <ImportedList kind={kind} category={category} overrides={overrides} onChange={setOverride} />
    </div>
  )
}

function Chip({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean
  small?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border transition-colors ${small ? 'px-3.5 py-1.5 text-xs' : 'px-5 py-2 text-sm font-medium'} ${
        active ? 'border-paper bg-paper text-ink' : 'text-soft hover:text-paper border-white/15 hover:border-white/40'
      }`}
    >
      {children}
    </button>
  )
}

function UploadBox({
  kind,
  category,
  onFiles,
  busy,
}: {
  kind: CategoryKind
  category: Category
  onFiles: (files: File[]) => void
  busy: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const accept = kind === 'videos' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp'
  const pick = (list: FileList | null) => {
    const files = [...(list ?? [])].filter((f) =>
      kind === 'videos'
        ? f.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(f.name)
        : f.type.startsWith('image/'),
    )
    if (files.length) onFiles(files)
    if (input.current) input.current.value = ''
  }
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        if (!busy) pick(e.dataTransfer.files)
      }}
      className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${
        drag ? 'border-accent bg-accent/5' : 'border-white/15'
      }`}
    >
      <p className="text-base font-medium">
        Adicionar {kind === 'videos' ? 'vídeos' : 'fotos'} em{' '}
        <span className="serif-accent text-xl">{category.title}</span>
      </p>
      <p className="text-mute mx-auto mt-2 max-w-md text-xs leading-relaxed">
        {kind === 'videos'
          ? `MP4 de até ${MAX_UPLOAD_BYTES / 1024 / 1024 / 1024} GB, em alta resolução. Arquivos grandes são enviados em partes e o envio continua se a internet oscilar. A capa é gerada automaticamente e pode ser trocada depois.`
          : 'JPG, PNG ou WEBP. As fotos são otimizadas automaticamente antes do envio, sem recorte.'}
      </p>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        id="upload-input"
        onChange={(e) => pick(e.target.files)}
        disabled={busy}
      />
      <label
        htmlFor="upload-input"
        className={`btn btn-primary mt-6 cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}
      >
        {busy ? 'Enviando…' : 'Escolher arquivos'}
      </label>
      <p className="text-mute mt-3 hidden text-xs sm:block">ou arraste os arquivos para cá</p>
    </div>
  )
}

function UploadedRow({
  work,
  first,
  last,
  onMove,
  onUpdate,
  onRemove,
  onPoster,
}: {
  work: UploadedWork
  first: boolean
  last: boolean
  onMove: (d: number) => void
  onUpdate: (patch: Partial<UploadedWork>) => void
  onRemove: () => void
  onPoster: (file: File) => void
}) {
  const isVideo = work.kind === 'video'
  const field = isVideo ? 'title' : 'alt'
  const [text, setText] = useState(work[field] ?? '')
  const posterInput = useRef<HTMLInputElement>(null)
  const thumb = isVideo ? work.poster : (work.small ?? work.src)
  return (
    <li className={`flex gap-4 rounded-xl border border-white/10 bg-black/20 p-3 ${work.hidden ? 'opacity-60' : ''}`}>
      <Thumb src={thumb} label={isVideo && !work.poster ? 'Sem capa' : undefined} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isVideo ? 'Título do vídeo' : 'Descrição da foto (acessibilidade)'}
            aria-label={isVideo ? 'Título' : 'Descrição'}
            className={inputClass}
          />
          {text !== (work[field] ?? '') && (
            <button type="button" className="btn btn-primary !px-4 !py-2" onClick={() => onUpdate({ [field]: text })}>
              Salvar
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <button type="button" className="link-underline text-soft" onClick={() => onUpdate({ hidden: !work.hidden })}>
            {work.hidden ? 'Mostrar no site' : 'Ocultar do site'}
          </button>
          {isVideo && (
            <>
              <button type="button" className="link-underline text-soft" onClick={() => posterInput.current?.click()}>
                Trocar capa
              </button>
              <input
                ref={posterInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && onPoster(e.target.files[0])}
              />
            </>
          )}
          <a href={work.src} target="_blank" rel="noreferrer" className="link-underline text-soft">
            Abrir arquivo
          </a>
          <button type="button" className="link-underline text-red-300" onClick={onRemove}>
            Excluir
          </button>
          {work.hidden && <span className="text-mute">· oculto</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <IconButton label="Subir" disabled={first} onClick={() => onMove(-1)}>
          ↑
        </IconButton>
        <IconButton label="Descer" disabled={last} onClick={() => onMove(1)}>
          ↓
        </IconButton>
      </div>
    </li>
  )
}

function Thumb({ src, label }: { src?: string | null; label?: string }) {
  return (
    <div className="bg-graphite grid h-24 w-16 shrink-0 place-items-center overflow-hidden rounded-md sm:h-28 sm:w-20">
      {src ? (
        <img src={src} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <span className="text-mute px-1 text-center text-[10px]">{label ?? '—'}</span>
      )}
    </div>
  )
}

function ImportedList({
  kind,
  category,
  overrides,
  onChange,
}: {
  kind: CategoryKind
  category: Category
  overrides: WorkOverrides
  onChange: (id: string, patch: WorkOverrides[string]) => void
}) {
  const items =
    kind === 'videos'
      ? (importedVideoWorks[category.slug] ?? []).map((w) => ({
          id: w.id,
          thumb: w.poster,
          title: w.title,
          video: true,
        }))
      : (importedPhotoWorks[category.slug] ?? []).map((p) => ({ id: p.id, thumb: p.src, title: p.alt, video: false }))
  if (!items.length) return null
  return (
    <section>
      <h3 className="text-sm font-semibold">Já publicados no site ({items.length})</h3>
      <p className="text-mute mt-1 text-xs">
        Trabalhos que vieram do site antigo. Você pode ocultar{kind === 'videos' ? ' ou dar um título' : ''}.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <ImportedRow key={it.id} item={it} override={overrides[it.id]} onChange={(p) => onChange(it.id, p)} />
        ))}
      </ul>
    </section>
  )
}

function ImportedRow({
  item,
  override,
  onChange,
}: {
  item: { id: string; thumb: string; title: string; video: boolean }
  override?: WorkOverrides[string]
  onChange: (patch: WorkOverrides[string]) => void
}) {
  const [title, setTitle] = useState(override?.title ?? '')
  const hidden = !!override?.hidden
  return (
    <li className={`flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3 ${hidden ? 'opacity-50' : ''}`}>
      <Thumb src={item.thumb} />
      <div className="min-w-0 flex-1 space-y-2">
        {item.video ? (
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={item.title}
              aria-label="Título"
              className={inputClass}
            />
            {title !== (override?.title ?? '') && (
              <button type="button" className="btn btn-primary !px-4 !py-2" onClick={() => onChange({ title })}>
                Salvar
              </button>
            )}
          </div>
        ) : (
          <p className="text-mute line-clamp-2 text-xs">{item.title}</p>
        )}
        <button
          type="button"
          className="link-underline text-soft text-xs"
          onClick={() => onChange({ hidden: !hidden })}
        >
          {hidden ? 'Mostrar no site' : 'Ocultar do site'}
        </button>
        {hidden && <span className="text-mute ml-2 text-xs">· oculto</span>}
      </div>
    </li>
  )
}
