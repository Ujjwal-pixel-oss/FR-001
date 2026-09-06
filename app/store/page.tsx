import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ProductGallery from "@/components/ProductGallery";
import StoreNav from "@/components/StoreNav";
import { getProducts } from "@/lib/products";

export default function StorePage() {
    const products = getProducts();

    return (
        <main className="min-h-screen bg-background flex flex-col pt-12">
            <StoreNav />
            <Hero />
            <ProductGallery products={products} />
            <Footer />
        </main>
    );
}
