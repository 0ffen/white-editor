import { WhiteEditor } from './white-editor';

export default function App() {
  return (
    <main className='mx-auto flex flex-col gap-8 p-6'>
      <div className='text-center'>
        <h1 className='mb-2 text-4xl font-bold italic'>WhiteEditor</h1>
      </div>
      <section className='space-y-3'>
        <WhiteEditor contentClassName='h-96' />
      </section>
    </main>
  );
}
