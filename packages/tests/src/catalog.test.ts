import type { CatalogApi } from '@backstage/catalog-client';
import { describe, beforeEach, it } from '@effection/jest';

import { createBackstage, createLDAPServer } from './support';

describe("catalog ingestion", () => {
  let catalog: CatalogApi;

  beforeEach(function* () {
    yield createLDAPServer({
      users: [{
        cn: 'cowboyd',
        uid: 'cowboyd',
        name: 'Charles Lowell',
        uuid: 'xyz123-cowboyd',
        mail: 'cowboyd@example.com',
        password: 'password',
        avatar: 'https://avatars.dicebear.com/api/open-peeps/cowboyd.svg'
      }]
    });

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

  it.eventually('ingests the example user from ldap into the catalog', function*() {
    let user = yield catalog.getEntityByRef('user:cowboyd')
    expect(user).toMatchObject({
      spec: {
        profile: {
          email: 'cowboyd@example.com',
          picture: 'https://avatars.dicebear.com/api/open-peeps/cowboyd.svg',
          displayName: 'Charles Lowell'
        }
      }
    })
  });
});
