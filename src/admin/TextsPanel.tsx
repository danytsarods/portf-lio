import { useEffect, useState } from 'react'
import { photoCategories, videoCategories } from '../content/categories'
import { categoryKey, defaultContent, type ContentValues } from '../content/remote'
import { errorMessage, loadContent, saveContent } from './supabase'
import { Card, Field, ListEditor, SaveBar, TextArea, TextInput } from './ui'

type Editable = Omit<ContentValues, 'work_overrides'>

/** Conteúdo atual: valores do projeto com as alterações já salvas por cima. */
async function loadEditable(): Promise<Editable> {
  const d = defaultContent()
  const c = await loadContent()
  return {
    site: { ...d.site, ...c.site },
    copy: { ...d.copy, ...c.copy },
    contact: { ...d.contact, ...c.contact },
    creator: { ...d.creator, ...c.creator },
    services: c.services?.length ? c.services : d.services,
    categories: Object.fromEntries(Object.entries(d.categories).map(([k, v]) => [k, { ...v, ...c.categories?.[k] }])),
  }
}

function useEditable() {
  const [data, setData] = useState<Editable | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    loadEditable().then(setData, (err) => setError(errorMessage(err)))
  }, [])
  const set = <K extends keyof Editable>(key: K, value: Editable[K]) => setData((d) => (d ? { ...d, [key]: value } : d))
  return { data, error, set }
}

const accentHint = (
  <>
    Coloque uma palavra entre <code className="text-paper">*asteriscos*</code> para destacá-la na fonte em itálico.
  </>
)

export function TextsPanel() {
  const { data, error, set } = useEditable()
  if (error) return <p className="text-sm text-red-300">{error}</p>
  if (!data) return <p className="text-mute text-sm">Carregando…</p>
  const copy = data.copy
  const setCopy = (patch: Partial<Editable['copy']>) => set('copy', { ...copy, ...patch })

  return (
    <div className="space-y-6">
      <Card title="Página inicial" description="O primeiro bloco que aparece ao abrir o site.">
        <Field label="Linha acima do título">
          <TextInput value={copy.heroEyebrow} onChange={(v) => setCopy({ heroEyebrow: v })} />
        </Field>
        <Field label="Título — primeira parte">
          <TextInput value={copy.heroTitle} onChange={(v) => setCopy({ heroTitle: v })} />
        </Field>
        <Field label="Título — segunda parte (em cinza)" hint={accentHint}>
          <TextInput value={copy.heroTitleMuted} onChange={(v) => setCopy({ heroTitleMuted: v })} />
        </Field>
        <Field label="Texto de apresentação">
          <TextArea value={copy.heroText} onChange={(v) => setCopy({ heroText: v })} />
        </Field>
        <SaveBar onSave={() => saveContent('copy', copy)} />
      </Card>

      <Card title="Creator" description="Aparece na página inicial e em “Sobre”.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome">
            <TextInput value={data.creator.name} onChange={(v) => set('creator', { ...data.creator, name: v })} />
          </Field>
          <Field label="Função">
            <TextInput value={data.creator.role} onChange={(v) => set('creator', { ...data.creator, role: v })} />
          </Field>
        </div>
        <Field label="Frase de apresentação (em destaque)">
          <TextArea value={data.creator.intro} onChange={(v) => set('creator', { ...data.creator, intro: v })} />
        </Field>
        <Field label="Parágrafos da trajetória" hint="O primeiro também aparece na página inicial.">
          <ListEditor
            items={data.creator.body}
            onChange={(body) => set('creator', { ...data.creator, body })}
            create={() => ''}
            addLabel="Adicionar parágrafo"
            render={(p, update) => <TextArea value={p} onChange={update} />}
          />
        </Field>
        <Field label="Números">
          <ListEditor
            items={data.creator.facts}
            onChange={(facts) => set('creator', { ...data.creator, facts })}
            create={() => ({ value: '', label: '' })}
            addLabel="Adicionar número"
            render={(f, update) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  placeholder="Valor (ex.: 3 anos)"
                  value={f.value}
                  onChange={(v) => update({ ...f, value: v })}
                />
                <TextInput
                  placeholder="Legenda (ex.: No audiovisual)"
                  value={f.label}
                  onChange={(v) => update({ ...f, label: v })}
                />
              </div>
            )}
          />
        </Field>
        <SaveBar onSave={() => saveContent('creator', data.creator)} />
      </Card>

      <Card title="Sobre — “Como pensamos”" description="Lista de pilares da página Sobre.">
        <ListEditor
          items={copy.aboutPillars}
          onChange={(aboutPillars) => setCopy({ aboutPillars })}
          create={() => ''}
          addLabel="Adicionar pilar"
          render={(p, update) => <TextInput value={p} onChange={update} />}
        />
        <SaveBar onSave={() => saveContent('copy', copy)} />
      </Card>

      <Card title="Serviços" description="Página Serviços e bloco de serviços da página inicial.">
        <Field label="Título da página" hint={accentHint}>
          <TextInput value={copy.servicesTitle} onChange={(v) => setCopy({ servicesTitle: v })} />
        </Field>
        <Field label="Introdução">
          <TextArea value={copy.servicesIntro} onChange={(v) => setCopy({ servicesIntro: v })} />
        </Field>
        <Field label="Serviços">
          <ListEditor
            items={data.services}
            onChange={(services) => set('services', services)}
            create={() => ({ title: '', text: '' })}
            addLabel="Adicionar serviço"
            render={(s, update) => (
              <>
                <TextInput placeholder="Nome do serviço" value={s.title} onChange={(v) => update({ ...s, title: v })} />
                <TextArea value={s.text} onChange={(v) => update({ ...s, text: v })} rows={2} />
              </>
            )}
          />
        </Field>
        <SaveBar
          onSave={async () => {
            await saveContent('copy', copy)
            await saveContent(
              'services',
              data.services.filter((s) => s.title.trim()),
            )
          }}
        />
      </Card>

      <Card title="Categorias" description="Nome, frase curta e introdução de cada página de categoria.">
        {[
          { label: 'Vídeos', list: videoCategories },
          { label: 'Fotografia', list: photoCategories },
        ].map((group) => (
          <div key={group.label} className="space-y-3">
            <h3 className="eyebrow">{group.label}</h3>
            {group.list.map((c) => {
              const key = categoryKey(c)
              const v = data.categories[key]
              const update = (patch: Partial<typeof v>) =>
                set('categories', { ...data.categories, [key]: { ...v, ...patch } })
              return (
                <details key={key} className="rounded-xl border border-white/10 bg-black/20 p-4 open:pb-5">
                  <summary className="cursor-pointer text-sm font-medium">{v.title}</summary>
                  <div className="mt-4 space-y-4">
                    <Field label="Nome">
                      <TextInput value={v.title} onChange={(t) => update({ title: t })} />
                    </Field>
                    <Field label="Frase curta">
                      <TextInput value={v.kicker} onChange={(t) => update({ kicker: t })} />
                    </Field>
                    <Field label="Introdução">
                      <TextArea value={v.intro} onChange={(t) => update({ intro: t })} />
                    </Field>
                  </div>
                </details>
              )
            })}
          </div>
        ))}
        <SaveBar onSave={() => saveContent('categories', data.categories)} />
      </Card>

      <Card title="Contato e chamada final">
        <Field label="Título da página Contato" hint={accentHint}>
          <TextInput value={copy.contactTitle} onChange={(v) => setCopy({ contactTitle: v })} />
        </Field>
        <Field label="Texto da página Contato">
          <TextArea value={copy.contactText} onChange={(v) => setCopy({ contactText: v })} />
        </Field>
        <Field label="Chamada no fim das páginas — linha de cima">
          <TextInput value={copy.ctaEyebrow} onChange={(v) => setCopy({ ctaEyebrow: v })} />
        </Field>
        <Field label="Chamada no fim das páginas — título" hint={accentHint}>
          <TextInput value={copy.ctaTitle} onChange={(v) => setCopy({ ctaTitle: v })} />
        </Field>
        <Field label="Chamada no fim das páginas — texto">
          <TextArea value={copy.ctaText} onChange={(v) => setCopy({ ctaText: v })} />
        </Field>
        <SaveBar onSave={() => saveContent('copy', copy)} />
      </Card>

      <Card
        title="Google e compartilhamento"
        description="Descrição usada nos resultados de busca e nas prévias de links."
      >
        <Field label="Descrição do site">
          <TextArea value={data.site.description} onChange={(v) => set('site', { ...data.site, description: v })} />
        </Field>
        <SaveBar onSave={() => saveContent('site', data.site)} />
      </Card>
    </div>
  )
}

export function ContactPanel() {
  const { data, error, set } = useEditable()
  if (error) return <p className="text-sm text-red-300">{error}</p>
  if (!data) return <p className="text-mute text-sm">Carregando…</p>
  const c = data.contact
  const update = (patch: Partial<typeof c>) => set('contact', { ...c, ...patch })
  const orNull = (v: string) => (v.trim() ? v.trim() : null)
  return (
    <Card title="Canais de contato" description="Um canal deixado em branco some do site automaticamente.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="WhatsApp (só números, com DDI e DDD)" hint="Ex.: 5548991336047">
          <TextInput
            inputMode="numeric"
            value={c.whatsapp ?? ''}
            onChange={(v) => update({ whatsapp: orNull(v.replace(/\D/g, '')) })}
          />
        </Field>
        <Field label="WhatsApp como aparece no site" hint="Ex.: +55 48 99133-6047">
          <TextInput value={c.whatsappDisplay ?? ''} onChange={(v) => update({ whatsappDisplay: orNull(v) })} />
        </Field>
      </div>
      <Field label="Mensagem inicial do WhatsApp">
        <TextArea value={c.whatsappMessage} onChange={(v) => update({ whatsappMessage: v })} rows={2} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Instagram (usuário, sem @)">
          <TextInput value={c.instagram ?? ''} onChange={(v) => update({ instagram: orNull(v.replace(/^@/, '')) })} />
        </Field>
        <Field label="E-mail">
          <TextInput type="email" value={c.email ?? ''} onChange={(v) => update({ email: orNull(v) })} />
        </Field>
      </div>
      <SaveBar onSave={() => saveContent('contact', c)} />
    </Card>
  )
}
