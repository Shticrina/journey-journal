const Hero = () => {
  return (
    <div className="relative bg-bluegray-light py-20 md:py-32 flex items-center justify-center min-h-[60vh]">
      {/* Background Image - replace with your own travel image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1501785888041-af3ba6f60060?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")' }}
      ></div>

      <div className="relative z-10 text-center text-bluegray-dark px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          Your Journey, Documented Beautifully.
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-semibold">
          Create, Share, and Relive Your Adventures.
        </p>
        <button className="bg-salmon-primary text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-opacity shadow-lg">
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default Hero;