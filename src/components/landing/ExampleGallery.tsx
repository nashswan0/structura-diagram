import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from '@/contexts/LanguageContext';
import flowchartImg from '@/assets/flowchart-login-process.png';
import classDiagramImg from '@/assets/class-diagram-library-system.png';
import sequenceDiagramImg from '@/assets/sequence-diagram-user-registration.png';
import erdImg from '@/assets/erd-ecommerce.png';

const ExampleGallery = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  
  const examples = [
    {
      title: t.exampleGallery.flowchart.title,
      subtitle: t.exampleGallery.flowchart.subtitle,
      description: t.exampleGallery.flowchart.description,
      image: flowchartImg
    },
    {
      title: t.exampleGallery.classDiagram.title,
      subtitle: t.exampleGallery.classDiagram.subtitle,
      description: t.exampleGallery.classDiagram.description,
      image: classDiagramImg
    },
    {
      title: t.exampleGallery.sequenceDiagram.title,
      subtitle: t.exampleGallery.sequenceDiagram.subtitle,
      description: t.exampleGallery.sequenceDiagram.description,
      image: sequenceDiagramImg
    },
    {
      title: t.exampleGallery.erd.title,
      subtitle: t.exampleGallery.erd.subtitle,
      description: t.exampleGallery.erd.description,
      image: erdImg
    }
  ];

  return (
    <>
      <section id="example-gallery" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {t.exampleGallery.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.exampleGallery.subtitle}
            </p>
          </div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {examples.map((example, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="hover-scale border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div 
                      className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedImage({ src: example.image, alt: `${example.title} - ${example.subtitle}` })}
                    >
                      <img 
                        src={example.image} 
                        alt={`${example.title} - ${example.subtitle}`}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardTitle className="text-lg">{example.subtitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {example.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>

    {/* Image Dialog */}
    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden">
        <DialogTitle className="sr-only">{selectedImage?.alt}</DialogTitle>
        {selectedImage && (
          <div className="relative w-full">
            <img 
              src={selectedImage.src} 
              alt={selectedImage.alt}
              className="w-full h-auto"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ExampleGallery;
