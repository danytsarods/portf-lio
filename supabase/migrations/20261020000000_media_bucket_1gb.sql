-- Vídeos em alta resolução: até 1 GB por arquivo no bucket de mídias.
-- O limite global do projeto (Storage → Settings) também precisa ser >= 1 GB, o que exige o plano Pro.
update storage.buckets set file_size_limit = 1073741824 where id = 'media';
