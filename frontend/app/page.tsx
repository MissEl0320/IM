"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type AppView = "landing" | "vehicles" | "motorcycles" | "cars" | "login" | "signup" | "forgot" | "verify_code" | "about" | "services" | "contact";

interface VehicleItem {
  id: string;
  name: string;
  price: string;
  status: "AVAILABLE" | "NOT AVAILABLE";
  color: string;
  imageSrc: string;
}

interface RentalFormData {
  fullName: string;
  phone: string;
  email: string;
  age: string;
  daysToUse: string;
  vehicleType: string;
  pickupDate: string;
  address: string;
  agreeToTerms: boolean;
}

export default function Home() {
  const [view, setView] = useState<AppView>("login");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"rent" | "reserve">("rent");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  // Auth Forms State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    identifier: "",
    resetCode: "",
    newPassword: "",
  });

  // Rental Form State
  const [rentalForm, setRentalForm] = useState<RentalFormData>({
    fullName: "",
    phone: "",
    email: "",
    age: "",
    daysToUse: "",
    vehicleType: "",
    pickupDate: "",
    address: "",
    agreeToTerms: false,
  });

  const motorcyclesData: VehicleItem[] = [
    { id: "m1", name: "HONDA CLICK V3", price: "P650 / DAY", status: "NOT AVAILABLE", color: "PINK", imageSrc: "/images/hondaclickv3.png" },
    { id: "m2", name: "HONDA CLICK V1", price: "P650 / DAY", status: "AVAILABLE", color: "WHITE", imageSrc: "/images/hondaclickv1.png" },
    { id: "m3", name: "HONDA CLICK V1", price: "P650 / DAY", status: "AVAILABLE", color: "RED", imageSrc: "/images/hondaclickv1red.png" },
    { id: "m4", name: "SUZUKI BURGMAN", price: "P650 / DAY", status: "AVAILABLE", color: "WHITE", imageSrc: "/images/suzukiburgman.png" },
    { id: "m5", name: "NMAX V1", price: "P650 / DAY", status: "NOT AVAILABLE", color: "BLUE", imageSrc: "/images/nmaxv1.png" },
    { id: "m6", name: "AEROX V2", price: "P650 / DAY", status: "AVAILABLE", color: "BLACK", imageSrc: "/images/aeroxv2.png" },
  ];

  const carsData: VehicleItem[] = [
    { id: "c1", name: "SUZUKI MINIVAN", price: "P1,000 / DAY", status: "AVAILABLE", color: "PURPLE", imageSrc: "/images/image 8.png" },
    { id: "c2", name: "SUZUKI APV", price: "P1,000 / DAY", status: "AVAILABLE", color: "BLACK", imageSrc: "/images/image 9.png" },
    { id: "c3", name: "PICANTO", price: "P1,000 / DAY", status: "AVAILABLE", color: "GREEN", imageSrc: "/images/image 10.png" },
    { id: "c4", name: "WIGO", price: "P1,000 / DAY", status: "AVAILABLE", color: "BLACK", imageSrc: "/images/image 11.png" },
    { id: "c5", name: "TOYOTA INNOVA", price: "P1,000 / DAY", status: "NOT AVAILABLE", color: "BLUE", imageSrc: "/images/image 12.png" },
    { id: "c6", name: "MONTERO SPORT", price: "P1,000 / DAY", status: "AVAILABLE", color: "BLACK", imageSrc: "/images/image 13.png" },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRentalChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setRentalForm({ ...rentalForm, [name]: checked });
    } else {
      setRentalForm({ ...rentalForm, [name]: value });
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("isLoggedIn");
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      identifier: "",
      resetCode: "",
      newPassword: "",
    });
    setView("login");
  };

  const handleAuthSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (view === "forgot") {
      try {
        const response = await fetch("https://im-1-o5b7.onrender.com/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Verification code sent to your email!");
          setView("verify_code");
        } else {
          alert(data.message || "Failed to send code.");
        }
      } catch {
        alert("Server error sending reset code.");
      }
    }
    else if (view === "verify_code") {
      try {
        const response = await fetch("https://im-1-o5b7.onrender.com/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            code: formData.resetCode,
            newPassword: formData.newPassword
          }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Password updated successfully!");
          setView("login");
        } else {
          alert(data.message || "Invalid or expired code.");
        }
      } catch {
        alert("Server error updating password.");
      }
    } 
    else if (view === "signup") {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      try {
        const response = await fetch("${process.env.REACT_APP_API_URL}/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Account created successfully!");
          setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
          setView("login");
        } else {
          alert(data.message || "Signup failed.");
        }
      } catch {
        alert("Cannot connect to backend server.");
      }
    } 
    else if (view === "login") {
      try {
        const response = await fetch("https://im-1-o5b7.onrender.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: formData.identifier,
            password: formData.password
          }),
        });
        const data = await response.json();

        if (response.ok) {
          alert("Login successful!");
          localStorage.setItem("isLoggedIn", "true");
          setView("landing");
        } else {
          alert(data.message || "Invalid credentials.");
        }
      } catch {
        alert("Login backend server connection offline.");
      }
    }
  };

  const openRentalModal = (vehicle: VehicleItem) => {
    setSelectedVehicle(vehicle);
    setModalMode(vehicle.status === "AVAILABLE" ? "rent" : "reserve");
    setRentalForm(prev => ({ ...prev, vehicleType: vehicle.name }));
    setIsModalOpen(true);
    setIsApproved(false);
  };

  const handleRentalSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsApproved(true);
  };

  const isAuthView = view === "login" || view === "signup" || view === "forgot" || view === "verify_code";

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col justify-between transition-all duration-500 select-none overflow-x-hidden antialiased relative"
      style={{
        backgroundImage: isAuthView ? "url('/images/Group 1.png')" : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {isAuthView && (
        <div className="absolute inset-0 bg-black/75 z-0 transition-opacity duration-500"></div>
      )}

      {/* HEADER NAVBAR */}
      <header className="relative z-10 flex justify-between items-center px-6 md:px-16 py-8 border-b border-zinc-900/40 backdrop-blur-md bg-zinc-950/20">
        <div
          onClick={() => !isAuthView && setView("landing")}
          className={`font-faster text-2xl md:text-3xl tracking-wider uppercase active:scale-95 transition-transform text-white ${!isAuthView ? "cursor-pointer" : "cursor-default"}`}
        >
          RENT<span className="text-red-500">GO</span>
        </div>
        <nav className="flex gap-6 md:gap-10 text-xs md:text-sm tracking-widest uppercase font-black items-center">
          <button onClick={() => setView("about")} className={`hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer ${view === "about" ? "text-red-500" : "text-zinc-400"}`}>ABOUT</button>
          <button onClick={() => setView("services")} className={`hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer ${view === "services" ? "text-red-500" : "text-zinc-400"}`}>SERVICES</button>
          <button onClick={() => setView("contact")} className={`hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer ${view === "contact" ? "text-red-500" : "text-zinc-400"}`}>CONTACT</button>
          
          {/* LOG OUT BUTTON */}
          {!isAuthView && (
            <button 
              onClick={handleLogOut} 
              className="text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer font-black"
            >
              LOG OUT
            </button>
          )}
        </nav>
      </header>

      {/* MAIN VIEW CONTROLLER RENDER PIPELINE */}
      <main className="relative z-10 flex flex-grow items-center justify-center px-6 md:px-16 py-12">

        {/* LANDING VIEW */}
        {view === "landing" && (
          <div className="w-full h-full flex flex-col justify-between max-w-[1100px] mt-4 min-h-[55vh] relative">
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 relative">
              <div className="w-full md:w-1/2 flex flex-col items-start text-left z-10">
                <h1 className="font-contrail text-5xl md:text-7xl uppercase tracking-tight leading-none mb-3">
                  WELCOME TO <br /> <span className="text-red-500">OUR RIDE !</span>
                </h1>
                <p className="font-concert text-xs md:text-sm tracking-[0.25em] text-zinc-400 mb-8 uppercase">
                  Connecting you to a perfect ride.
                </p>
                <div className="text-base md:text-lg font-medium tracking-wide text-zinc-300 max-w-[450px] leading-relaxed">
                  <p>Ride with confidence, drive with freedom, reliable vehicles for every journey.</p>
                </div>
              </div>
              <div className="w-full md:w-auto md:absolute md:right-[-40px] md:top-[-20px] flex justify-center md:justify-end items-center pointer-events-none select-none z-0">
                <img src="/images/image 1.png" alt="Vehicle Showcase" className="w-auto h-auto max-h-[300px] md:max-h-[440px] lg:max-h-[480px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]" />
              </div>
            </div>
            <div className="w-full flex justify-center mt-12 z-10">
              <button onClick={() => setView("vehicles")} className="font-concert px-10 py-4 bg-red-600 text-white rounded-xl font-bold tracking-wider text-sm md:text-base hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all duration-300 active:scale-[0.98]">
                PRESS HERE TO START RENTING
              </button>
            </div>
          </div>
        )}

        {/* VEHICLE TYPE SELECTION VIEW */}
        {view === "vehicles" && (
          <div className="w-full max-w-[900px] flex flex-col items-center text-center mt-4">
            <h2 className="font-concert text-2xl md:text-4xl font-normal uppercase tracking-tight mb-12 max-w-[750px] leading-tight">
              WHAT TYPE OF VEHICLE ARE YOU LOOKING TO RENT?
            </h2>
            <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-10 lg:gap-16">
              <div className="flex flex-col items-center gap-4 group w-full max-w-[280px]">
                <div onClick={() => setView("motorcycles")} className="w-full h-[320px] bg-zinc-900/30 backdrop-blur-md border border-zinc-900 rounded-3xl flex items-center justify-center cursor-pointer hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02] shadow-2xl overflow-hidden">
                  <img src="/images/suzuki burgman.png" alt="Motorcycle" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300" />
                </div>
                <button onClick={() => setView("motorcycles")} className="font-concert w-full py-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 text-zinc-200 rounded-xl font-bold tracking-wider text-xs uppercase hover:bg-zinc-800 transition-all">
                  MOTORCYCLE
                </button>
              </div>
              <div className="flex flex-col items-center gap-4 group w-full max-w-[280px]">
                <div onClick={() => setView("cars")} className="w-full h-[320px] bg-zinc-900/30 backdrop-blur-md border border-zinc-900 rounded-3xl flex items-center justify-center cursor-pointer hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02] shadow-2xl overflow-hidden">
                  <img src="/images/Mitsubishi Xpander.png" alt="Car" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300" />
                </div>
                <button onClick={() => setView("cars")} className="font-concert w-full py-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 text-zinc-200 rounded-xl font-bold tracking-wider text-xs uppercase hover:bg-zinc-800 transition-all">
                  CAR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MOTORCYCLES SELECTION GRID */}
        {view === "motorcycles" && (
          <div className="w-full max-w-[1100px] flex flex-col items-center relative">
            <div className="w-full flex justify-start mb-6">
              <button onClick={() => setView("vehicles")} className="font-concert px-5 py-2 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 text-zinc-300 rounded-lg text-xs uppercase font-bold tracking-wider hover:bg-zinc-800 transition-all">BACK</button>
            </div>
            <h2 className="font-concert text-3xl font-black uppercase tracking-tight text-red-500 mb-10">MOTORCYCLES</h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {motorcyclesData.map((bike) => (
                <div key={bike.id} className="flex flex-col items-center gap-4 w-full max-w-[310px] group">
                  <div className="w-full h-[300px] bg-zinc-900/30 backdrop-blur-md border border-zinc-900/80 rounded-2xl flex flex-col justify-between p-5 hover:border-zinc-800 transition-all duration-300 shadow-xl">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden p-2">
                      <img src={bike.imageSrc} alt={bike.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="w-full flex flex-col gap-1 mt-2 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-sm text-zinc-100">{bike.name}</span>
                        <span className="text-red-400 font-bold">{bike.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] mt-1 text-zinc-400">
                        <span className={`font-bold ${bike.status === "AVAILABLE" ? "text-emerald-400" : "text-zinc-500"}`}>{bike.status}</span>
                        <span>COLOR : <span className="text-zinc-200 font-semibold">{bike.color}</span></span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => openRentalModal(bike)} className="font-concert w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl font-bold tracking-wider text-xs uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200">
                    {bike.status === "AVAILABLE" ? "RENT NOW" : "RESERVE"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CARS SELECTION GRID */}
        {view === "cars" && (
          <div className="w-full max-w-[1100px] flex flex-col items-center relative">
            <div className="w-full flex justify-start mb-6">
              <button onClick={() => setView("vehicles")} className="font-concert px-5 py-2 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 text-zinc-300 rounded-lg text-xs uppercase font-bold tracking-wider hover:bg-zinc-800 transition-all">BACK</button>
            </div>
            <h2 className="font-concert text-3xl font-black uppercase tracking-tight text-red-500 mb-10">CARS</h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {carsData.map((car) => (
                <div key={car.id} className="flex flex-col items-center gap-4 w-full max-w-[310px] group">
                  <div className="w-full h-[300px] bg-zinc-900/30 backdrop-blur-md border border-zinc-900/80 rounded-2xl flex flex-col justify-between p-5 hover:border-zinc-800 transition-all duration-300 shadow-xl">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden p-4">
                      <img src={car.imageSrc} alt={car.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="w-full flex flex-col gap-1 mt-2 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-sm text-zinc-100">{car.name}</span>
                        <span className="text-red-400 font-bold">{car.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] mt-1 text-zinc-400">
                        <span className={`font-bold ${car.status === "AVAILABLE" ? "text-emerald-400" : "text-zinc-500"}`}>{car.status}</span>
                        <span>COLOR : <span className="text-zinc-200 font-semibold">{car.color}</span></span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => openRentalModal(car)} className="font-concert w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl font-bold tracking-wider text-xs uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200">
                    {car.status === "AVAILABLE" ? "RENT NOW" : "RESERVE"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT PAGE VIEW */}
        {view === "about" && (
          <div className="w-full max-w-[1100px] flex flex-col items-center mt-2 text-left">
            <h2 className="font-concert text-center text-3xl md:text-5xl font-black uppercase tracking-tight text-red-500 mb-12">WELCOME TO RENTGO</h2>
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-4 space-y-6 text-sm md:text-base font-normal tracking-wide leading-relaxed text-zinc-300">
                <p>At <span className="text-white font-bold">RENTGO</span>, we make transportation simple, convenient, and reliable. Whether you need a car for a family trip, a motorcycle for quick city travel, or a vehicle for your next adventure, RENTGO is here to help you get on the road with ease.</p>
                <p>Our platform allows customers to rent cars and motorcycles anytime with a fast and hassle-free process. If your preferred vehicle is currently unavailable, you can reserve it in advance and secure your booking for your desired date and time.</p>
                <p>We aim to provide affordable, safe, and well-maintained vehicles for every type of traveler. From daily transportation to vacations, business meetings, airport transfers, and special occasions, RENTGO offers flexible rental options that fit your needs.</p>
              </div>
              <div className="lg:col-span-4 flex justify-center items-center w-full min-h-[420px] lg:scale-125 xl:scale-135 transition-transform duration-300">
                <img src="/images/Montero Sport.png" alt="About Vehicle Front" className="w-full h-auto max-h-[500px] lg:max-h-[600px] object-contain drop-shadow-[-30px_20px_40px_rgba(0,0,0,0.95)]" />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <h3 className="font-concert text-red-400 font-bold text-lg uppercase tracking-wide mb-3">WHAT WE OFFER</h3>
                  <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-zinc-400 tracking-wide">
                    <li>Wide selection of cars and motorcycles</li>
                    <li>Easy online booking and reservation system</li>
                    <li>Vehicle availability tracking</li>
                    <li>Advance reservation for unavailable vehicles</li>
                    <li>Affordable rental rates</li>
                    <li>Safe and well-maintained units</li>
                    <li>Customer support for booking assistance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-concert text-red-400 font-bold text-lg uppercase tracking-wide mb-3">WHY CHOOSE RENTGO?</h3>
                  <p className="text-xs md:text-sm tracking-wide leading-relaxed text-zinc-400">At RENTGO, customer satisfaction is our priority. We focus on providing a smooth rental experience by making booking easier, faster, and more accessible for everyone. Our goal is to help customers travel comfortably and confidently wherever they go.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SERVICES PAGE VIEW */}
        {view === "services" && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Service item 1 */}
          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-900 rounded-2xl p-5 flex gap-5 items-center hover:border-zinc-800/80 shadow-xl transition-all">
            <div className="w-[140px] h-[140px] bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-900">
              <img src="/images/image 14.png" alt="Car Rental" className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-concert text-zinc-100 font-bold text-lg uppercase tracking-wide">CAR RENTAL</h3>
              <p className="text-xs md:text-sm text-zinc-400 tracking-wide leading-relaxed">
                Drive comfortably with our wide range of rental cars perfect for family trips, business travel, vacations, and daily transportation.
              </p>
            </div>
          </div>

          {/* Service item 2 */}
          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-900 rounded-2xl p-5 flex gap-5 items-center hover:border-zinc-800/80 shadow-xl transition-all">
            <div className="w-[140px] h-[140px] bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-900">
              <img src="/images/image 15.png" alt="Motorcycle Rental" className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-concert text-zinc-100 font-bold text-lg uppercase tracking-wide">MOTORCYCLE RENTAL</h3>
              <p className="text-xs md:text-sm text-zinc-400 tracking-wide leading-relaxed">
                Affordable and convenient motorcycle rentals for quick travel, city rides, and personal transportation.
              </p>
            </div>
          </div>

          {/* Service item 3 */}
          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-900 rounded-2xl p-5 flex gap-5 items-center hover:border-zinc-800/80 shadow-xl transition-all">
            <div className="w-[140px] h-[140px] bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-900">
              <img src="/images/image 16.png" alt="Vehicle Reservation" className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-concert text-zinc-100 font-bold text-lg uppercase tracking-wide">VEHICLE RESERVATION</h3>
              <p className="text-xs md:text-sm text-zinc-400 tracking-wide leading-relaxed">
                Reserve your preferred vehicle in advance if it is currently unavailable. Secure your booking for your desired schedule without worrying.
              </p>
            </div>
          </div>

          {/* Service item 4 */}
          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-900 rounded-2xl p-5 flex gap-5 items-center hover:border-zinc-800/80 shadow-xl transition-all">
            <div className="w-[140px] h-[140px] bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-900">
              <img src="/images/image 17.png" alt="Adventure Trips" className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-concert text-zinc-100 font-bold text-lg uppercase tracking-wide">ADVENTURE TRIPS</h3>
              <p className="text-xs md:text-sm text-zinc-400 tracking-wide leading-relaxed">
                Perfect vehicles for outdoor adventures, long rides, and exploring new horizons safely.
              </p>
            </div>
          </div>
        </div>
        )}

        {/* CONTACT PAGE VIEW */}
        {view === "contact" && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
              {/* LEFT COLUMN: CONTACT INFORMATION */}
              <div className="space-y-8">
                <div className="space-y-5">
                  <h3 className="font-concert text-zinc-100 font-bold text-lg uppercase tracking-wide">CONTACT INFORMATION</h3>
                  <div className="text-sm space-y-4 text-zinc-400">
                    <div>
                      <p className="text-red-400 font-black text-xs tracking-wider uppercase mb-0.5">Address :</p>
                      <p className="text-zinc-200">Cebu City, Philippines</p>
                    </div>
                    <div>
                      <p className="text-red-400 font-black text-xs tracking-wider uppercase mb-0.5">Phone Number :</p>
                      <p className="text-zinc-200">+63 967 676 7676</p>
                    </div>
                    <div>
                      <p className="text-red-400 font-black text-xs tracking-wider uppercase mb-0.5">Email Address :</p>
                      <p className="text-zinc-200">rentgoofficial@gmail.com</p>
                    </div>
                    <div>
                      <p className="text-red-400 font-black text-xs tracking-wider uppercase mb-0.5">Business Hours :</p>
                      <p className="text-zinc-200">Monday - Sunday | 8:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-900/60">
                  <h3 className="font-concert text-zinc-100 font-bold text-base uppercase tracking-wide">FOLLOW US</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Stay updated with premium promotions, seasonal discounts, and instant fleet announcements.
                  </p>
                  <div className="flex gap-4 text-xs font-bold text-zinc-300 uppercase tracking-wider pt-1">
                    <span className="hover:text-red-400 cursor-pointer transition-colors">Facebook</span>
                    <span className="text-zinc-800">•</span>
                    <span className="hover:text-red-400 cursor-pointer transition-colors">Instagram</span>
                    <span className="text-zinc-800">•</span>
                    <span className="hover:text-red-400 cursor-pointer transition-colors">TikTok</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SEND US A MESSAGE CARD */}
              <div className="bg-zinc-900/20 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full min-h-[380px]">
                <div>
                  <h3 className="font-concert text-zinc-100 font-bold text-lg uppercase tracking-wide mb-4">SEND US A MESSAGE</h3>
                  <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-6">
                    You can immediately contact our live operations channel for any of the following parameters:
                  </p>
                  <ul className="space-y-3 text-xs md:text-sm text-zinc-400 mb-6">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Car and motorcycle rental inquiries</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Vehicle reservation concerns</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Booking and scheduling assistance</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Custom fleet availability metrics</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Corporate rates and custom accounts</li>
                  </ul>
                </div>


              </div>
            </div>
        )}

        {/* AUTHENTICATION VIEW BLOCKS */}
        {isAuthView && (
          <div className="w-full max-w-[400px] bg-zinc-900/40 backdrop-blur-md border border-zinc-900/80 rounded-2xl px-8 py-10 flex flex-col items-center shadow-2xl relative z-10">
            <h2 className="font-concert text-xl md:text-2xl font-black uppercase tracking-widest mb-8 text-center text-zinc-100">
              {view === "login" && "LOG IN"}
              {view === "signup" && "SIGN UP"}
              {view === "forgot" && "FORGOT PASSWORD"}
              {view === "verify_code" && "VERIFY CODE"}
            </h2>

            <form onSubmit={handleAuthSubmit} className="w-full flex flex-col gap-4">
              {view === "signup" && (
                <>
                  <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                  <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                  <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                </>
              )}

              {view === "login" && (
                <>
                  <input type="text" name="identifier" placeholder="Username or email" value={formData.identifier} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                </>
              )}

              {view === "forgot" && (
                <>
                  <p className="text-zinc-400 text-xs text-center mb-2 leading-relaxed">Enter your email address to receive a 6-digit reset code.</p>
                  <input type="email" name="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                </>
              )}

              {view === "verify_code" && (
                <>
                  <input type="text" name="resetCode" maxLength={6} placeholder="Enter Code" value={formData.resetCode} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 tracking-[0.5em] text-center placeholder-zinc-700 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm font-bold transition-all" />
                  <input type="password" name="newPassword" placeholder="Enter New Password" value={formData.newPassword} onChange={handleChange} required className="w-full bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 px-5 py-3 rounded-xl outline-none border border-zinc-900 focus:border-red-500/40 text-sm transition-all" />
                </>
              )}

              <button type="submit" className="font-concert w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest mt-2 transition-colors shadow-md shadow-red-600/10">
                {view === "forgot" && "SEND CODE"}
                {view === "verify_code" && "RESET PASSWORD"}
                {(view === "login" || view === "signup") && "CONTINUE"}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-2 text-xs text-zinc-500">
              {view === "login" && (
                <>
                  <button type="button" onClick={() => setView("signup")} className="hover:text-zinc-300 transition-colors bg-transparent border-none cursor-pointer">
                    Don't have an account? <span className="text-red-400 font-semibold">Sign Up</span>
                  </button>
                  <button type="button" onClick={() => setView("forgot")} className="hover:text-zinc-300 transition-colors mt-1 bg-transparent border-none cursor-pointer">
                    Forgot Password?
                  </button>
                </>
              )}
              {view === "signup" && (
                <button type="button" onClick={() => setView("login")} className="hover:text-zinc-300 transition-colors bg-transparent border-none cursor-pointer">
                  Already have an account? <span className="text-red-400 font-semibold">Log In</span>
                </button>
              )}
              {(view === "forgot" || view === "verify_code") && (
                <button type="button" onClick={() => setView("login")} className="hover:text-zinc-300 transition-colors text-red-400 font-semibold bg-transparent border-none cursor-pointer">
                  Back to Log In
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* RENTAL / RESERVATION MODAL LAYER */}
      {isModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md bg-black/60 transition-all animate-fadeIn">
          <div className="w-full max-w-[550px] bg-zinc-900/90 border border-zinc-850 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col my-8">
            <header className="p-6 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-950/40 relative z-10">
              <div className="flex flex-col">
                <h3 className="font-concert text-lg uppercase tracking-wider text-white">
                  {modalMode === "rent" ? "RENTAL APPLICATION" : "ADVANCE RESERVATION"}
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-zinc-400 mt-0.5">
                  Vehicle Unit: <span className="text-red-400 font-black">{selectedVehicle.name}</span>
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer">✕</button>
            </header>

            <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6 relative z-10">
              {!isApproved ? (
                <form onSubmit={handleRentalSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">Full Name</label>
                      <input type="text" name="fullName" required value={rentalForm.fullName} onChange={handleRentalChange} className="w-full bg-zinc-950/80 text-zinc-100 border border-zinc-850 rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">Phone Number</label>
                      <input type="tel" name="phone" required value={rentalForm.phone} onChange={handleRentalChange} className="w-full bg-zinc-950/80 text-zinc-100 border border-zinc-850 rounded-xl px-4 py-3 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">Email Address</label>
                      <input type="email" name="email" required value={rentalForm.email} onChange={handleRentalChange} className="w-full bg-zinc-950/80 text-zinc-100 border border-zinc-850 rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-bold uppercase tracking-wider block">Age</label>
                        <input type="number" name="age" required value={rentalForm.age} onChange={handleRentalChange} className="w-full bg-zinc-950/80 text-zinc-100 border border-zinc-850 rounded-xl px-4 py-3 outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-bold uppercase tracking-wider block">Days</label>
                        <input type="number" name="daysToUse" required value={rentalForm.daysToUse} onChange={handleRentalChange} className="w-full bg-zinc-950/80 text-zinc-100 border border-zinc-850 rounded-xl px-4 py-3 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">Vehicle Selected</label>
                      <input type="text" readOnly value={rentalForm.vehicleType} className="w-full bg-zinc-950/40 text-zinc-500 border border-zinc-900 rounded-xl px-4 py-3 cursor-not-allowed select-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold uppercase tracking-wider block">Pickup Date</label>
                      <input type="date" name="pickupDate" required value={rentalForm.pickupDate} onChange={handleRentalChange} className="w-full bg-zinc-950/80 text-zinc-100 border border-zinc-850 rounded-xl px-4 py-3 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider block">Current Address</label>
                    <textarea name="address" required value={rentalForm.address} onChange={handleRentalChange} rows={2} className="w-full bg-zinc-950/80 text-zinc-100 border border-zinc-850 rounded-xl px-4 py-3 outline-none resize-none" />
                  </div>

                  <div className="pt-2 flex items-start gap-3">
                    <input type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={rentalForm.agreeToTerms} onChange={handleRentalChange} required className="mt-0.5 w-4 h-4 accent-red-600 transition-all cursor-pointer" />
                    <label htmlFor="agreeToTerms" className="text-[11px] text-zinc-400 leading-relaxed cursor-pointer select-none">
                      I understand that RENTGO requires valid government identification upon unit handover, and I verify that all parameters inputed above are systematically legitimate.
                    </label>
                  </div>

                  <button type="submit" className="font-concert w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold tracking-widest uppercase transition-colors shadow-lg mt-4">
                    {modalMode === "rent" ? "SUBMIT APPLICATION" : "CONFIRM RESERVATION"}
                  </button>
                </form>
              ) : (
                <div className="w-full py-6 flex flex-col items-center text-center animate-scaleUp">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl mb-4">✓</div>
                  <h4 className="font-concert text-xl text-zinc-100 uppercase tracking-wider mb-2">APPLICATION SUBMITTED!</h4>
                  <p className="text-zinc-400 text-xs max-w-[380px] leading-relaxed mb-6">Thank you, <span className="text-white font-bold">{rentalForm.fullName}</span>. Your request for the <span className="text-zinc-200 font-semibold">{selectedVehicle.name}</span> has been dispatched.</p>
                  <button onClick={() => setIsModalOpen(false)} className="font-concert px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold tracking-wider uppercase transition-all mt-4">CLOSE WINDOW</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER LAYER */}
      <footer className="relative z-10 w-full text-center py-8 border-t border-zinc-900/40 text-[11px] text-zinc-500 font-medium tracking-wider uppercase mt-auto">
        <p>© 2026 RENTGO. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}