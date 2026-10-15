import { useToast } from '../ui-kit';
export default function useCopy() {
  const toast = useToast();
  return async (text, receipt) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(receipt);
    } catch {
      toast('The browser would not let us copy — select it and copy it yourself', 'bad');
    }
  };
}
