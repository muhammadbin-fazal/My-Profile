import './globals.css';

export const metadata = {
  title: 'Frameform Studio — Video that moves people',
  description:
    'Frameform is an independent video editing studio creating sharp, story-first edits for brands, creators, and ambitious ideas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
