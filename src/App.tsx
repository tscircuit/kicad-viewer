import { useQuery } from "react-query"
import { useState, useEffect } from "react"
import { FaGithub, FaTwitter, FaGitlab } from "react-icons/fa6"
import { MdSubdirectoryArrowRight } from "react-icons/md"

function App() {
  const {
    data: kicadFiles,
    error,
    isLoading: sidebarLoading,
  } = useQuery(
    "kicadFiles",
    async () => {
      const response = await fetch(
        "https://kicad-mod-cache.tscircuit.com/kicad_files.json"
      )
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    },
    {
      cacheTime: 60_000 * 60,
      staleTime: 60_000 * 60,
      refetchOnWindowFocus: false,
    }
  )

  const [searchTerm, setSearchTerm] = useState("")
  const [expandedDirs, setExpandedDirs] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const { data: fileContent, error: fileError } = useQuery(
    ["fileContent", selectedFile],
    async () => {
      const response = await fetch(
        `https://kicad-mod-cache.tscircuit.com/${selectedFile}`
      )
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.text()
    },
    {
      cacheTime: 60_000 * 60,
      staleTime: 60_000 * 60,
      refetchOnWindowFocus: false,
    }
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

  const handleFileSelect = async (filePath: string) => {
    setSelectedFile(filePath)
    window.location.hash = filePath
  }

  const handleViewRandom = () => {
    if (kicadFiles && kicadFiles.length > 0) {
      const randomFile =
        kicadFiles[Math.floor(Math.random() * kicadFiles.length)]
      handleFileSelect(randomFile)
    }
  }

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (hash) {
      handleFileSelect(hash)
    } else {
      handleViewRandom()
    }
  }, [kicadFiles])

  const filteredData = kicadFiles?.filter((filePath: string) =>
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

  if (error) return <div>Error: {(error as Error).message}</div>
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 text-sm flex border-b-gray-200 border-b items-center">
        <h1 className=" font-semibold text-gray-700">
          <a href="https://github.com/tscircuit/kicad-viewer">
            tscircuit / kicad-viewer
          </a>
        </h1>
        <a
          className="text-blue-600 inline-flex items-center ml-2"
          href="https://github.com/tscircuit/kicad-viewer"
        >
          <img
            src="https://img.shields.io/github/stars/tscircuit/kicad-viewer?style=social"
            alt="GitHub Stars"
          />
        </a>
        <div className="flex-grow" />
        <a
          className="flex items-center mr-4 opacity-80"
          href="https://github.com/tscircuit/tscircuit"
        >
          <FaGithub className="mr-1 opacity-70" />
          tscircuit
        </a>
        <a
          className="flex items-center opacity-80"
          href="https://gitlab.com/kicad/libraries/kicad-footprints"
        >
          <FaGitlab className="mr-1 opacity-70" />
          KiCad Footprints
        </a>
      </header>
      <div className="flex flex-1">
        <aside
          className="bg-gray-200 overflow-y-scroll max-w-[400px] w-1/3 flex-shrink-0 p-4 text-sm"
          style={{
            maxHeight: "calc(100vh - 110px)",
          }}
        >
          <div>
            <div
              className="text-blue-600 cursor-pointer"
              onClick={handleViewRandom}
            >
              view random
            </div>
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
                      <li
                        key={file}
                        className="whitespace-nowrap"
                        onClick={() => handleFileSelect(`${dir}/${file}`)}
                      >
                        {file.replace(".kicad_mod", "")}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {/* XXX entries hidden */}
          {searchTerm && (
            <div className="text-xs text-gray-600 mt-4 text-center">
              {kicadFiles?.length - filteredData?.length} entries filtered out
            </div>
          )}
        </aside>
        <section className="flex-1 p-4">
          {selectedFile && (
            <div>
              <h3 className="text-md font-semibold flex flex-col">
                <div
                  className="opacity-70 cursor-pointer"
                  onClick={() => {
                    // select the directory in the sidebar
                    toggleDir(selectedFile.split("/")[0])
                  }}
                >
                  {selectedFile.split("/")[0]}
                </div>
                <div className="flex items-center ml-2">
                  <MdSubdirectoryArrowRight />
                  {selectedFile.split("/")[1]}
                  <a
                    className="font-normal text-blue-600 ml-2"
                    href={`https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/${selectedFile}?ref_type=heads`}
                  >
                    source
                  </a>
                </div>
              </h3>
              {/* <pre className="bg-gray-100 p-4">{fileContent}</pre> */}
              {(fileError as any) && (
                <div className="text-red-600">
                  Error: {(fileError as any).message}
                </div>
              )}
            </div>
          )}
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
