import { CVEIngestService } from '../cve-ingest/services/cve-ingest.service';
import { CVERepositoryDownloadService } from '../cve-ingest/services/cve-repository-download.service';
import { CVEPersistenceService } from '../cve-ingest/services/cve-persistence.service';

export async function seedVulnerabilities(
  cveIngestService: CVEIngestService,
  repositoryService: CVERepositoryDownloadService,
  persistenceService: CVEPersistenceService,
) {
  console.log('Asegurando disponibilidad del repositorio CVE...');
  let repoHasChanges = false;
  try {
    const result = await repositoryService.ensureRepositoryAvailable();
    repoHasChanges = result.hasChanges;
  } catch (error) {
    console.error('Error al asegurar el repositorio CVE:', error);
    return;
  }

  if (!repoHasChanges) {
    const count = await persistenceService.count();
    if (count > 0) {
      console.log(`Repositorio sin cambios y BD ya poblada (${count} vulnerabilidades). Omitiendo seed.`);
      return;
    }
  }

  const availableYears = await cveIngestService.getAvailableYears();
  if (availableYears.length === 0) {
    console.error('No se encontraron años disponibles en el repositorio CVE.');
    return;
  }

  const startYear = process.env.CVE_SEED_START_YEAR
    ? parseInt(process.env.CVE_SEED_START_YEAR, 10)
    : Math.min(...availableYears);
  const endYear = process.env.CVE_SEED_END_YEAR
    ? parseInt(process.env.CVE_SEED_END_YEAR, 10)
    : Math.max(...availableYears);

  console.log(`Iniciando seed de vulnerabilidades (${startYear}-${endYear}, ${availableYears.length} años disponibles)...`);

  try {
    const summary = await cveIngestService.ingestCVEs({ startYear, endYear });
    console.log(
      `Seed de vulnerabilidades completo: procesadas=${summary.processed}, insertadas=${summary.inserted}, actualizadas=${summary.updated}, fallidas=${summary.failed}`,
    );
  } catch (error) {
    console.error('Error durante el seed de vulnerabilidades:', error);
  }
}
