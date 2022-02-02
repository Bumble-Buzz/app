
export default function ContentWrapper({ children }) {
  return (
    <main className="flex flex-nowrap flex-col items-center px-0 py-1 w-full">
      <div className="flex flex-nowrap rounded shadow-lg w-full" style={{minHeight: '500px'}}>
        {children}
      </div>
    </main>
  )
}
