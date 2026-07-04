export const QUERY_EVENTS = /* GraphQL */ `
  query Events {
    events {
      nodes {
        databaseId
        slug
        title
        content
        eventFields {
          eventDate
        }
        featuredImage {
          node {
            databaseId
            sourceUrl(size: LARGE)
          }
        }
        categories {
          nodes {
            databaseId
            slug
            name
          }
        }
      }
    }
  }
`;

export const QUERY_EVENT = /* GraphQL */ `
  query Event($slug: ID!) {
    event(id: $slug, idType: SLUG) {
      databaseId
      slug
      title
      content
      eventFields {
        eventDate
      }
      featuredImage {
        node {
          databaseId
          sourceUrl(size: LARGE)
        }
      }
      categories {
        nodes {
          databaseId
          slug
          name
        }
      }
    }
  }
`;

export const QUERY_PAGE = /* GraphQL */ `
  query Page($uri: ID!) {
    page(id: $uri, idType: URI) {
      databaseId
      slug
      title
      content
      featuredImage {
        node {
          databaseId
          sourceUrl(size: LARGE)
        }
      }
      pageFields {
        gallery {
          nodes {
            databaseId
            sourceUrl(size: _2048X2048)
          }
        }
      }
    }
  }
`;

export const QUERY_POSTS = /* GraphQL */ `
  query Posts {
    posts {
      nodes {
        databaseId
        slug
        date
        title
        content
        featuredImage {
          node {
            databaseId
            sourceUrl(size: LARGE)
          }
        }
        categories {
          nodes {
            databaseId
            slug
            name
          }
        }
      }
    }
  }
`;

export const QUERY_POST = /* GraphQL */ `
  query Post($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      databaseId
      slug
      date
      title
      content
      featuredImage {
        node {
          databaseId
          sourceUrl(size: LARGE)
        }
      }
      categories {
        nodes {
          databaseId
          slug
          name
        }
      }
    }
  }
`;
