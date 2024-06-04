import { useQuery } from "react-query"
import { useState } from "react"
import { FaGithub, FaTwitter } from "react-icons/fa"

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

  const [searchTerm, setSearchTerm] = useState("")
  const [expandedDirs, setExpandedDirs] = useState<{ [key: string]: boolean }>(
    {}
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const toggleDir = (dir: string) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [dir]: !prev[dir],
    }))
  }

  const filteredData = data?.filter((filePath: string) =>
    filePath.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const dirStructure: { [key: string]: string[] } = {}

  filteredData?.forEach((filePath: string) => {
    const [dir, file] = filePath.split("/")
    if (!dirStructure[dir]) {
      dirStructure[dir] = []
    }
    dirStructure[dir].push(file)
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {(error as Error).message}</div>
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4">
        <h1 className="text-md">kicad viewer</h1>
      </header>
      <div className="flex flex-1">
        <aside
          className="bg-gray-200 overflow-y-scroll max-w-[300px] w-1/3 p-4 text-xs"
          style={{
            maxHeight: "calc(100vh - 110px)",
          }}
        >
          <div>
            <div className="text-blue-600 cursor-pointer">view random</div>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mb-4 p-2 border border-gray-300"
          />
          <ul>
            {Object.keys(dirStructure).map((dir) => (
              <li key={dir}>
                <div
                  onClick={() => toggleDir(dir)}
                  className="cursor-pointer font-bold"
                >
                  {dir}
                </div>
                {(expandedDirs[dir] ||
                  (searchTerm && filteredData?.length < 100)) && (
                  <ul className="ml-4 cursor-pointer">
                    {dirStructure[dir].map((file) => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex-1 p-4">
          <h2 className="text-md">Content</h2>
        </section>
      </div>
      <footer className="p-4 text-xs text-center flex justify-center items-center gap-1">
        made with
        <a
          className="text-blue-600 inline-flex items-center"
          href="https://github.com/tscircuit/tscircuit"
        >
          <FaGithub className="mt-0.5 mr-0.5" />
          <span>tscircuit</span>
        </a>
        by
        <a
          className="text-blue-600 inline-flex items-center"
          href="https://x.com/seveibar"
        >
          <FaTwitter className="mt-0.5 mr-0.5" />
          <span>seveibar</span>
        </a>
      </footer>
    </div>
  )
}

export default App
