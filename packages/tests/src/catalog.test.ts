import type { CatalogApi } from '@backstage/catalog-client';
import { describe, beforeEach, it } from '@effection/jest';
import { createBackstage } from './support';

describe("catalog ingestion", () => {
  let catalog: CatalogApi;

  beforeEach(function* () {
    catalog = yield createBackstage();
  });

  it('can connect to the catalog', function*() {
    expect(yield catalog.getEntities()).toBeDefined();
  });

  it.eventually('ingests the artist lookup component ', function*() {
    const component = yield catalog.getEntityByRef('component:artist-lookup');
    expect(component).toMatchObject({
      metadata: {
        name: 'artist-lookup',
        description: "Artist Lookup",
        tags: ["java", "data"],
      },
      spec: {
        type: 'service',
        owner: 'team-a',
        system: 'artist-engagement-portal'
      }
    });
  });
});
