
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";

export function SchoolGallery({ images }: { images?: string[] }) {

    if (!images || images.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-8">

            {/* Main Image */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="md:col-span-2 md:row-span-2 relative h-full min-h-[200px] cursor-pointer group">
                        <Image
                            src={images[0]}
                            alt="Vue principale"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <div className="relative w-full aspect-video">
                        <Image
                            src={images[0]}
                            alt="Vue principale Full"
                            fill
                            className="object-contain"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Secondary Images */}
            {images.slice(1, 5).map((img, idx) => (
                <Dialog key={idx}>
                    <DialogTrigger asChild>
                        <div className="relative h-full min-h-[150px] hidden md:block cursor-pointer group">
                            <Image
                                src={img}
                                alt={`Vue ${idx + 2}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                        <div className="relative w-full aspect-video">
                            <Image
                                src={img}
                                alt={`Vue ${idx + 2} Full`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            ))}
        </div>
    );
}
