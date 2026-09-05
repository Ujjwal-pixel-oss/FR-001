import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ProductGallery from "@/components/ProductGallery";
import { getProducts } from "@/lib/products";

export default function Home() {
    const products = getProducts();

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Hero />
            <ProductGallery products={products} />
            <Footer />
        </main>
    );
}
