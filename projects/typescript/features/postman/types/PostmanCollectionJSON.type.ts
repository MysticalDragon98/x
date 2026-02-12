/**
 * Postman Collection Format v2.1.0 (collection.json)
 * Official schema/docs:
 * - https://schema.getpostman.com/collection/json/v2.1.0/draft-07/docs/index.html
 * - https://learning.postman.com/collection-format/
 */
export type PostmanCollectionJSON = {
  info: PostmanCollectionInfo;
  item: Array<PostmanItem | PostmanItemGroup>;

  auth?: PostmanAuth;
  event?: PostmanEvent[];
  variable?: PostmanVariable[];
  protocolProfileBehavior?: Record<string, unknown>;
};

export type PostmanCollectionInfo = {
  name: string;
  schema: string; // typically "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" :contentReference[oaicite:1]{index=1}

  _postman_id?: string;
  description?: PostmanDescription;
  version?: PostmanVersion;
  _exporter_id?: string;
  _collection_link?: string;
};

export type PostmanVersion = string | { major: number; minor: number; patch: number; identifier?: string; meta?: string };

export type PostmanDescription =
  | string
  | {
      content?: string;
      type?: "text/plain" | "text/markdown" | string;
      version?: string;
    };

export type PostmanVariable = {
  id?: string;
  key: string;
  value?: any;
  type?: "string" | "boolean" | "number" | "any" | string;
  name?: string;
  description?: PostmanDescription;
  system?: boolean;
  disabled?: boolean;
};

export type PostmanEvent = {
  id?: string;
  listen: "prerequest" | "test" | string;
  script?: PostmanScript;
  disabled?: boolean;
};

export type PostmanScript = {
  id?: string;
  type?: "text/javascript" | string;
  exec?: string[]; // lines
  src?: PostmanUrl | string;
  name?: string;
};

export type PostmanItemGroup = {
  id?: string;
  name?: string;
  description?: PostmanDescription;

  item: Array<PostmanItem | PostmanItemGroup>;

  auth?: PostmanAuth;
  event?: PostmanEvent[];
  variable?: PostmanVariable[];
  protocolProfileBehavior?: Record<string, unknown>;
};

export type PostmanItem = {
  id?: string;
  name?: string;
  description?: PostmanDescription;

  request: PostmanRequest;
  response?: PostmanResponse[];

  event?: PostmanEvent[];
  protocolProfileBehavior?: Record<string, unknown>;
};

export type PostmanRequest = {
  method?: string;
  header?: PostmanHeader[];
  body?: PostmanRequestBody;
  url?: PostmanUrl | string;
  auth?: PostmanAuth;
  description?: PostmanDescription;
};

export type PostmanHeader = {
  key: string;
  value: string;

  type?: "text" | string;
  disabled?: boolean;
  description?: PostmanDescription;
};

export type PostmanRequestBody =
  | {
      mode: "raw";
      raw?: string;
      options?: {
        raw?: { language?: string };
      };
      disabled?: boolean;
    }
  | {
      mode: "urlencoded";
      urlencoded?: PostmanKeyValue[];
      disabled?: boolean;
    }
  | {
      mode: "formdata";
      formdata?: PostmanFormParam[];
      disabled?: boolean;
    }
  | {
      mode: "file";
      file?: { src?: string | null };
      disabled?: boolean;
    }
  | {
      mode: "graphql";
      graphql?: { query?: string; variables?: string };
      disabled?: boolean;
    };

export type PostmanKeyValue = {
  key: string;
  value?: any;
  type?: "text" | string;
  disabled?: boolean;
  description?: PostmanDescription;
};

export type PostmanFormParam =
  | (PostmanKeyValue & { type?: "text" })
  | (Omit<PostmanKeyValue, "value"> & { type: "file"; src?: string | string[] });

export type PostmanUrl =
  | string
  | {
      raw?: string;
      protocol?: string;
      host?: string[] | string;
      path?: string[] | string;
      port?: string | number;
      query?: PostmanQueryParam[];
      hash?: string;
      variable?: PostmanVariable[];
    };

export type PostmanQueryParam = {
  key: string;
  value?: any;
  disabled?: boolean;
  description?: PostmanDescription;
};

export type PostmanAuth = {
  type?: PostmanAuthType;
  noauth?: any[];
  apikey?: PostmanAuthAttribute[];
  basic?: PostmanAuthAttribute[];
  bearer?: PostmanAuthAttribute[];
  digest?: PostmanAuthAttribute[];
  hawk?: PostmanAuthAttribute[];
  ntlm?: PostmanAuthAttribute[];
  oauth1?: PostmanAuthAttribute[];
  oauth2?: PostmanAuthAttribute[];
  awsv4?: PostmanAuthAttribute[];
  // postman supports others; keep it open:
  [k: string]: any;
};

export type PostmanAuthType =
  | "noauth"
  | "apikey"
  | "basic"
  | "bearer"
  | "digest"
  | "hawk"
  | "ntlm"
  | "oauth1"
  | "oauth2"
  | "awsv4"
  | string;

export type PostmanAuthAttribute = {
  key: string;
  value?: any;
  type?: string;
};

export type PostmanResponse = {
  id?: string;
  name?: string;
  originalRequest?: PostmanRequest;

  status?: string;
  code?: number;

  header?: PostmanHeader[];
  cookie?: PostmanCookie[];
  body?: string;

  responseTime?: number;
  timings?: Record<string, any>;
};

export type PostmanCookie = {
  domain?: string;
  expires?: string | null;
  hostOnly?: boolean;
  httpOnly?: boolean;
  name?: string;
  path?: string;
  secure?: boolean;
  session?: boolean;
  value?: string;

  extensions?: string[];
  maxAge?: string;
};
