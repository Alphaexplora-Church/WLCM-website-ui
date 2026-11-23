export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inspiration: string;
  hearAboutUs: string;
}

export interface Program {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  closingLine: string;
  cta: string;
  duration: string;
  tag: string;
  image?: string;
  previewLabel?: string;
}

export interface FindFreedomViewModelState {
  form: FormData;
  isSubmitted: boolean;
  isLoading: boolean;
  error: string | null;
  programs: Program[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleReset: () => void;
}
