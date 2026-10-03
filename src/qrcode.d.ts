declare module "qrcode/lib/browser.js" {
  export interface QrSvg {
    toString(
      text: string,
      options: {
        type: "svg";
        margin?: number;
        errorCorrectionLevel?: "L" | "M" | "Q" | "H";
        color?: { dark?: string; light?: string };
      },
    ): Promise<string>;
  }

  export const toString: QrSvg["toString"];
  const qr: QrSvg;
  export default qr;
}
