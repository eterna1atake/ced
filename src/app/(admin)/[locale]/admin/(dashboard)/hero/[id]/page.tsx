import { notFound } from "next/navigation";
import EditHeroClient from "./EditHeroClient";
import dbConnect from "@/lib/mongoose";
import HeroCarousel from "@/collections/HeroCarousel";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditHeroPage({ params }: PageProps) {
    const { id } = await params;

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hero: any = null;
    try {
        hero = await HeroCarousel.findById(id).lean();
    } catch (e) {
        console.error("Invalid ID or not found", e);
    }

    if (!hero) {
        notFound();
    }

    // Convert to plain object for client serialization
    const serializedHero = JSON.parse(JSON.stringify(hero));
    if (!serializedHero.id && serializedHero._id) {
        serializedHero.id = serializedHero._id.toString();
    }

    return <EditHeroClient initialData={serializedHero} />;

}
