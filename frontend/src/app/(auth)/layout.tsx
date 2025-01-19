export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className={"w-full h-screen flex items-center justify-center"}>
        <div
          className={
            "w-[80%] p-1 sm:p-5 sm:w-[50%] h-[70vh] flex justify-center items-center"
          }
        >
          {children}
        </div>
      </main>
    </>
  );
}
