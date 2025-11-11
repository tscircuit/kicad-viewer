import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
	FaGithub,
	FaTwitter,
	FaGitlab,
	FaFolder,
	FaFolderOpen,
	FaRegLightbulb,
} from "react-icons/fa6";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { PCBViewer } from "@tscircuit/pcb-viewer";
import { parseKicadModToTscircuitSoup } from "kicad-mod-converter";

function App() {
	// Use /api for localhost and Vercel deployments (which proxy to the external API)
	// Vercel deployments will have the API proxied via vercel.json rewrites
	// For other deployments, use the direct URL or set VITE_USE_API_PROXY=true
	const useApiProxy =
		import.meta.env.VITE_USE_API_PROXY === "true" ||
		window.location.hostname === "localhost" ||
		window.location.hostname.includes("localhost") ||
		window.location.hostname.endsWith(".vercel.app");
	const serverUrl = useApiProxy
		? "/api"
		: "https://kicad-mod-cache.tscircuit.com";
	const {
		data: kicadFiles,
		error,
		isLoading: sidebarLoading,
	} = useQuery({
		queryKey: ["kicadFiles"],
		queryFn: async () => {
			const response = await fetch(`${serverUrl}/kicad_files.json`);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response
				.json()
				.then((r) => r.filter((f: string) => f.endsWith(".kicad_mod")));
		},
		gcTime: 60_000 * 60,
		staleTime: 60_000 * 60,
		refetchOnWindowFocus: false,
	});

	const [searchTerm, setSearchTerm] = useState("");
	const [expandedDirs, setExpandedDirs] = useState<{ [key: string]: boolean }>(
		{},
	);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const { data: fileContent, error: fileError } = useQuery({
		queryKey: ["fileContent", selectedFile],
		queryFn: async () => {
			const response = await fetch(`${serverUrl}/${selectedFile}`);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.text();
		},
		enabled: Boolean(selectedFile),
		gcTime: 60_000 * 60,
		staleTime: 60_000 * 60,
		refetchOnWindowFocus: false,
	});

	const { data: soup, error: soupError } = useQuery({
		queryKey: ["fileSoup", fileContent],
		queryFn: () => parseKicadModToTscircuitSoup(fileContent as string),
		enabled: Boolean(fileContent),
		gcTime: 60_000 * 60,
		staleTime: 60_000 * 60,
		refetchOnWindowFocus: false,
	});

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const toggleDir = (dir: string) => {
		setExpandedDirs((prev) => ({
			...prev,
			[dir]: !prev[dir],
		}));
	};

	const handleFileSelect = async (filePath: string) => {
		setSelectedFile(filePath);
		window.location.hash = filePath;
	};

	const handleViewRandom = () => {
		if (kicadFiles && kicadFiles.length > 0) {
			const randomFile =
				kicadFiles[Math.floor(Math.random() * kicadFiles.length)];
			handleFileSelect(randomFile);
		}
	};

	useEffect(() => {
		const hash = window.location.hash.substring(1);
		if (hash) {
			handleFileSelect(hash);
		} else {
			handleViewRandom();
		}
	}, [kicadFiles]);

	const filteredData = kicadFiles?.filter((filePath: string) =>
		filePath.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const dirStructure: { [key: string]: string[] } = {};

	filteredData?.forEach((filePath: string) => {
		const [dir, file] = filePath.split("/");
		if (!dirStructure[dir]) {
			dirStructure[dir] = [];
		}
		dirStructure[dir].push(file);
	});

	if (error) return <div>Error: {(error as Error).message}</div>;
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
					className="text-blue-600 mr-4 text-xs"
					href="https://github.com/tscircuit/kicad-viewer/issues"
				>
					File Issue
				</a>
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
			<div className="flex flex-1 flex-col md:flex-row">
				<aside className="bg-gray-200 overflow-y-scroll md:max-w-[400px] md:w-1/3 flex-shrink-0 p-4 text-sm max-h-[30vh] md:max-h-[calc(100vh-64px)]">
					<div className="flex gap-2">
						<div
							className="text-blue-600 cursor-pointer"
							onClick={handleViewRandom}
						>
							view random
						</div>
						<div
							className="text-blue-600 cursor-pointer"
							onClick={() => {
								if (Object.keys(expandedDirs).length === 0) {
									const expanded: { [key: string]: boolean } = {};
									Object.keys(dirStructure).forEach((dir) => {
										expanded[dir] = true;
									});
									setExpandedDirs(expanded);
								} else {
									// collapse all
									setExpandedDirs({});
								}
							}}
						>
							{Object.keys(expandedDirs).length === 0
								? `expand all`
								: `collapse all`}
						</div>
					</div>
					<div className="mb-4 relative">
						<input
							type="text"
							placeholder="Search..."
							value={searchTerm}
							onChange={handleSearchChange}
							className="p-2 border border-gray-300 w-full"
						/>
						{/* clear search floating X only when there's a search term */}
						{searchTerm && (
							<div
								className="cursor-pointer text-gray-600 absolute p-2 right-1 top-1"
								onClick={() => setSearchTerm("")}
							>
								<FaTimes />
							</div>
						)}
					</div>
					<ul>
						{Object.keys(dirStructure).map((dir) => (
							<li key={dir}>
								<div
									onClick={() => toggleDir(dir)}
									className="cursor-pointer font-bold flex items-center"
								>
									{expandedDirs[dir] ? (
										<FaFolderOpen className="opacity-70 mr-2" />
									) : (
										<FaFolder className="opacity-70 mr-2" />
									)}
									{dir}
									<span className="ml-2 text-gray-600 font-normal">
										({dirStructure[dir].length})
									</span>
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
							<h3 className="text-md font-semibold flex flex-col mb-4">
								<div
									className="opacity-70 cursor-pointer"
									onClick={() => {
										// select the directory in the sidebar
										toggleDir(selectedFile.split("/")[0]);
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
							{soup && (
								<div className="relative">
									<div className="absolute top-[-22px] right-0 flex text-gray-500 items-center justify-end text-xs">
										<FaRegLightbulb />
										<div className="mb-1 ml-1">
											press "d" on your keyboard to take measurements
										</div>
									</div>
									<PCBViewer
										circuitJson={soup as any}
										allowEditing={false}
										height={Math.min(800, window.innerHeight - 200)}
									/>
									<footer className="p-4 text-xs text-right flex justify-end items-center gap-1">
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
							)}
							{/* <pre className="bg-gray-100 p-4">{fileContent}</pre> */}
							{(fileError as any) && (
								<div className="text-red-600">
									Error: {(fileError as any).message}
								</div>
							)}
							{(soupError as any) && (
								<div className="text-red-600">
									Error converting kicad_mod: {(soupError as any).message}
								</div>
							)}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default App;
