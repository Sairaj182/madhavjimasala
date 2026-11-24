export const STORE_API_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

export class StoreApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly orderId?: string,
  ) {
    super(message);
  }
}

export async function storeResponse<T>(response: Response, fallback: string): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const data = await response.json().catch(() => null);
  throw new StoreApiError(
    typeof data?.error === "string" ? data.error : fallback,
    response.status,
    typeof data?.code === "string" ? data.code : undefined,
    typeof data?.orderId === "string" ? data.orderId : undefined,
  );
}
