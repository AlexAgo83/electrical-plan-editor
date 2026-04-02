export interface ParseJsonError {
  code: "invalid-json";
  message: string;
  cause: unknown;
}

export type ParseJsonResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ParseJsonError;
    };

export function parseJsonSafe<T>(raw: string): ParseJsonResult<T> {
  try {
    return {
      ok: true,
      value: JSON.parse(raw) as T
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "invalid-json",
        message: "Stored JSON payload is malformed and could not be parsed.",
        cause: error
      }
    };
  }
}
