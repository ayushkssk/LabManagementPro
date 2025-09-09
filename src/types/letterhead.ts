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
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAlign?: 'left' | 'center' | 'right';
  width?: string;
  zIndex?: number;
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

export interface LetterheadSection {
  height: number;
  showOnFirstPage: boolean;
  showOnOtherPages: boolean;
  elements: LHElement[];
}

export interface LetterheadTemplate {
  id: string;
  name: string;
  description?: string;
  type?: LetterheadType;
  isDefault?: boolean;
  isPdf?: boolean;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  pageSize?: string;
  orientation?: 'portrait' | 'landscape';
  header?: LetterheadSection;
  footer?: LetterheadSection;
  body?: LetterheadSection;
  content?: LHElement[];
  settings: {
    primaryColor?: string;
    fontFamily?: string;
    backgroundColor?: string;
    showFooter?: boolean;
    showPageNumbers?: boolean;
    pageNumberFormat?: string;
    printBackground?: boolean;
    scale?: number;
    watermark?: {
      text?: string; // watermark text
      color?: string; // rgba recommended e.g. rgba(0,0,0,.06)
      angle?: number; // degrees
      opacity?: number; // 0..1
    };
  };
  styles?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    baseFontSize?: string;
    lineHeight?: number;
    textColor?: string;
    linkColor?: string;
    borderColor?: string;
  };
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    header: number;
    footer: number;
  };
  elements?: LHElement[];
}

export type LetterheadType = 'billing' | 'report' | 'prescription' | 'general';
