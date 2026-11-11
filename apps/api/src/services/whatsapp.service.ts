const AISENSY_API_URL =
  "https://backend.aisensy.com/campaign/t1/api/v2";

// Convert any Indian mobile format → 91XXXXXXXXXX (AiSensy destination)
function toWhatsAppNumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export type WhatsAppResult =
  | { success: true; messageId?: string }
  | { success: false; error: string };

async function post(payload: object): Promise<WhatsAppResult> {
  try {
    const res = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (data?.error || data?.success === false) {
      return {
        success: false,
        error: String(
          data?.error ?? data?.message ?? "AiSensy rejected the request"
        ),
      };
    }
    return { success: true, messageId: data?.messageId as string | undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export class WhatsAppService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.AISENSY_API_KEY ?? "";
    if (!this.apiKey) {
      console.warn(
        "⚠️  AISENSY_API_KEY is not set. WhatsApp messages will fail."
      );
    }
  }

  private base(
    campaignName: string,
    mobile: string,
    userName: string,
    templateParams: string[]
  ) {
    return {
      apiKey: this.apiKey,
      campaignName,
      destination: toWhatsAppNumber(mobile),
      userName,
      templateParams,
      media: {},
    };
  }

  async sendOTP(
    mobile: string,
    otp: string
  ): Promise<WhatsAppResult> {
    if (!this.apiKey) return { success: false, error: "Missing API Key" };
    return post({
      ...this.base("auth_otp_new", mobile, "madhavji", [otp]),
      source: "new-landing-page form",
      buttons: [
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [{ type: "text", text: otp }],
        },
      ],
      carouselCards: [],
      location: {},
      paramsFallbackValue: { FirstName: "Student" },
    });
  }

  async sendWelcomeMessage(
    mobile: string,
    name: string
  ): Promise<WhatsAppResult> {
    if (!this.apiKey) return { success: false, error: "Missing API Key" };
    return post(this.base("welcome_enquiry_2026", mobile, name, [name]));
  }

  async sendCampaignMessage(
    mobile: string,
    studentName: string,
    campaignName: string,
    templateParams: string[] = []
  ): Promise<WhatsAppResult> {
    if (!this.apiKey) return { success: false, error: "Missing API Key" };
    return post({
      ...this.base(campaignName, mobile, studentName, templateParams),
      source: "api-bulk-sender",
      buttons: [],
      carouselCards: [],
      location: {},
      paramsFallbackValue: { FirstName: studentName || "Student" },
    });
  }
}

export const whatsappService = new WhatsAppService();
