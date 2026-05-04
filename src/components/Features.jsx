const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center">
    <div className="text-salmon-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-bluegray-dark mb-2">{title}</h3>
    <p className="text-bluegray-medium">{description}</p>
  </div>
);

const Features = () => {
  return (
    <section className="py-16 bg-bluegray-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-bluegray-dark mb-12">Why Travelin?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>}
            title="Organize Your Trips"
            description="Keep all your travel itineraries, photos, and notes in one place."
          />
          <FeatureCard
            icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
            title="Visual Memories"
            description="Showcase your best photos and videos in stunning galleries."
          />
          <FeatureCard
            icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 00-2-2h-1a2 2 0 00-2 2v2.488"></path></svg>}
            title="Interactive Maps"
            description="Pinpoint your exact locations and see your journey unfold on a map."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;