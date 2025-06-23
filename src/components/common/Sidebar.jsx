import { BookMarked , MessageCircleQuestion , Menu,Dock ,ListCollapse,  Newspaper, ArchiveRestore, LogOut  } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const SIDEBAR_ITEMS = [
	{ name: "GST 2R ", icon: Dock , color: "#3B82F6", href: "/Emails" },
	{ name: "Excel",icon: BookMarked ,color: "#10B981",href: "/dashboard"}
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const navigate = useNavigate();

	// Logout functionality
	const handleLogout = () => {
		// Clear any stored authentication data
		localStorage.removeItem('authToken');
		localStorage.removeItem('userData');
		sessionStorage.removeItem('authToken');
		sessionStorage.removeItem('userData');
		
		// Clear any cookies if you're using them
		document.cookie.split(";").forEach((c) => {
			document.cookie = c
				.replace(/^ +/, "")
				.replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
		});

		// Show confirmation message
		alert("You have been logged out successfully!");
		
		// Redirect to login page
		navigate('/login');
	};

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
				isSidebarOpen ? "w-64" : "w-20"
			}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className='h-full bg-white shadow-lg border-r border-gray-200 p-4 flex flex-col'>
				{/* Header Section */}
				<div className="flex items-center justify-between mb-8">
					<AnimatePresence>
						{isSidebarOpen && (
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.2 }}
								className="flex items-center"
							>
								<div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
									<span className="text-white font-bold text-sm">G</span>
								</div>
								<div>
									<h2 className="text-lg font-bold text-gray-900">GST Portal</h2>
									<p className="text-xs text-gray-500">Reconciliation</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className='p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900'
					>
						<Menu size={20} />
					</motion.button>
				</div>

				{/* Navigation Section */}
				<nav className='flex-grow'>
					<AnimatePresence>
						{isSidebarOpen && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2, delay: 0.1 }}
								className="mb-6"
							>
								<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
									Navigation
								</h3>
							</motion.div>
						)}
					</AnimatePresence>

					{SIDEBAR_ITEMS.map((item, index) => (
						<Link key={item.href} to={item.href}>
							<motion.div 
								className='flex items-center p-3 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-200 mb-2 group border border-transparent hover:shadow-sm'
								whileHover={{ x: 4 }}
								transition={{ duration: 0.2 }}
							>
								<div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
									style={{ backgroundColor: `${item.color}15` }}>
									<item.icon size={18} style={{ color: item.color }} />
								</div>
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className='ml-3 whitespace-nowrap text-gray-700 group-hover:text-gray-900 font-medium'
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
								
								{/* Active indicator */}
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.div
											className="ml-auto w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
										/>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}
				</nav>

				{/* Logout Button */}
				<div className="mt-4 mb-4">
					<motion.button
						onClick={handleLogout}
						className='w-full flex items-center p-3 text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-200 transition-all duration-200 group border border-transparent hover:shadow-sm text-gray-700 hover:text-red-600'
						whileHover={{ x: 4 }}
						whileTap={{ scale: 0.98 }}
						transition={{ duration: 0.2 }}
					>
						<div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 bg-red-50 group-hover:bg-red-100">
							<LogOut size={18} className="text-red-500" />
						</div>
						<AnimatePresence>
							{isSidebarOpen && (
								<motion.span
									className='ml-3 whitespace-nowrap font-medium'
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ duration: 0.2, delay: 0.3 }}
								>
									Logout
								</motion.span>
							)}
						</AnimatePresence>
					</motion.button>
				</div>

				{/* Footer Section */}
				<AnimatePresence>
					{isSidebarOpen && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.2 }}
							className="mt-auto pt-4 border-t border-gray-200"
						>
							<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
								<div className="flex items-center mb-2">
									<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
										<span className="text-blue-600 text-xs">✓</span>
									</div>
									<span className="text-sm font-semibold text-gray-900">System Status</span>
								</div>
								<p className="text-xs text-gray-600">All systems operational</p>
								<div className="flex items-center mt-2">
									<div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
									<span className="text-xs text-green-600 font-medium">Online</span>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default Sidebar;
