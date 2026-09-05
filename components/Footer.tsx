export default function Footer() {
    return (
        <footer className="bg-zinc-900 text-zinc-100 py-12 px-8 md:px-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4 text-primary">
                        Jai Shree Balaji Screw House
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Deals in: Brass, Steels, Wooden Screw & Deep Junction
                        Box & All Type Electrical & Hardware Goods.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                    <address className="not-italic text-zinc-400 text-sm space-y-2">
                        <p>2057/4, Bhagirath Palace,</p>
                        <p>Behind Jubilee Cinema,</p>
                        <p>Delhi - 110006</p>
                    </address>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
                    <div className="text-zinc-400 text-sm space-y-2">
                        <p>
                            <span className="font-medium text-white">
                                Mobile:
                            </span>{" "}
                            9350281644
                        </p>
                        <p>
                            <span className="font-medium text-white">
                                Mobile:
                            </span>{" "}
                            8383901871
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-500">
                © {new Date().getFullYear()} Jai Shree Balaji Screw House. All
                rights reserved.
            </div>
        </footer>
    );
}
