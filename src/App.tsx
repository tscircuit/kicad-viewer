import "./App.css"

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl">Header</h1>
      </header>
      <div className="flex flex-1">
        <aside className="bg-gray-200 w-1/4 p-4">
          <h2 className="text-xl">Sidebar</h2>
        </aside>
        <section className="flex-1 p-4">
          <h2 className="text-xl">Content</h2>
        </section>
      </div>
      <footer className="bg-blue-500 text-white p-4">
        <h2 className="text-xl">Footer</h2>
      </footer>
    </div>
  )
}

export default App
