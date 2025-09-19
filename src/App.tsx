import { SimpleEditor } from '@/templates/simple/simple-editor';
import { TooltipProvider } from './components';

export default function App() {
  return (
    <TooltipProvider>
      <main className='mx-auto flex flex-col gap-5 p-4'>
        <h1 className='text-2xl font-bold'>Editor</h1>
        <SimpleEditor />
      </main>
    </TooltipProvider>
  );
}
