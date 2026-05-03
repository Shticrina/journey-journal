const Footer = () => {
  return (
    <footer className="bg-bluegray-dark text-white py-4 sm:py-6 md:py-8">
		<div className="flex flex-col sm:flex-row items-center sm:justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm md:text-base">
			<p className="">&copy; {new Date().getFullYear()} Travelin. All rights reserved.</p>
			
			<div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-2 sm:space-y-0 mt-2 sm:mt-0">
				<a href="#" className="hover:text-salmon-primary transition-colors">Privacy Policy</a>
				<a href="#" className="hover:text-salmon-primary transition-colors">Terms of Service</a>

				{/* Social Media Icons (example) */}
				<div className="flex items-center space-x-2 sm:space-x-3">
					<a href="#" className="hover:text-salmon-primary transition-colors">
						<svg className="w-6 h-6 inline-block" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 10.072v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.12 4.12 0 003.834 2.85A8.233 8.233 0 012 18.188a11.624 11.624 0 006.29 1.84"></path></svg>
					</a>
					
					<a href="#" className="hover:text-salmon-primary transition-colors">
						<svg className="w-6 h-6 inline-block" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h3.046l-.492 2.987h-2.554v6.987C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
					</a>
				</div>
			</div>
		</div>
    </footer>
  );
};

export default Footer;