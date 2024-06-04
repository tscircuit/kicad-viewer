import { useQuery } from "react-query"

function App() {
  const { data, error, isLoading } = useQuery("kicadFiles", async () => {
    const response = await fetch(
      "https://kicad-mod-cache.tscircuit.com/kicad_files.json"
    )
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    return response.json()
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {(error as Error).message}</div>
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4">
        <h1 className="text-md">kicad viewer</h1>
      </header>
      <div className="flex flex-1">
        <aside className="bg-gray-200 w-1/4 p-4">
          <h2 className="text-md">Sidebar</h2>
        </aside>
        <section className="flex-1 p-4">
          <h2 className="text-md">Content</h2>
        </section>
      </div>
      <footer className="p-4 text-xs text-center">
        made with tscircuit & <a href="https://x.com/seveibar">@seveibar</a>
      </footer>
    </div>
  )
}

export default App
