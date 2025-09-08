export type LHElementType = 'text' | 'html' | 'logo' | 'line' | 'field';

export interface LHPosition {
  x: number; // px relative to canvas
  y: number; // px relative to canvas
}

export interface LHSize {
  w: number; // width px
  h: number; // height px
}

export interface LHStyle {
  color?: string;
  fontFamily?: string;
  fontSize?: number; // px
  fontWeight?: number | 'bold' | 'normal';
  textAlign?: 'left' | 'center' | 'right';
}

export interface LHElementBase {
  id: string;
  type: LHElementType;
  position: LHPosition;
  size?: LHSize;
  style?: LHStyle;
}

export interface LHTextElement extends LHElementBase {
  type: 'text';
  text: string;
}

export interface LHHtmlElement extends LHElementBase {
  type: 'html';
  html: string; // sanitized on render
}

export interface LHLogoElement extends LHElementBase {
  type: 'logo';
  src: string; // url/base64
}

export interface LHLineElement extends LHElementBase {
  type: 'line';
  thickness?: number;
  color?: string;
}

export type LHFieldKey =
  | 'name'
  | 'address'
  | 'phone'
  | 'email'
  | 'gstin'
  | 'registration';

export interface LHFieldElement extends LHElementBase {
  type: 'field';
  field: LHFieldKey;
  label?: string; // optional label prefix
}

export type LHElement =
  | LHTextElement
  | LHHtmlElement
  | LHLogoElement
  | LHLineElement
  | LHFieldElement;

export interface LetterheadTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    primaryColor?: string;
    fontFamily?: string;
    backgroundColor?: string;
    showFooter?: boolean;
    watermark?: {
      text?: string; // watermark text
      color?: string; // rgba recommended e.g. rgba(0,0,0,.06)
      angle?: number; // degrees
      opacity?: number; // 0..1
    };
  };
  elements: LHElement[];
}
