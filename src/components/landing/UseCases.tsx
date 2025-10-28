import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Code2, Brain, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const UseCases = () => {
  const { t } = useLanguage();
  
  const useCases = [
    {
      icon: GraduationCap,
      title: t.useCases.students.title,
      description: t.useCases.students.description
    },
    {
      icon: Code2,
      title: t.useCases.developers.title,
      description: t.useCases.developers.description
    },
    {
      icon: Brain,
      title: t.useCases.researchers.title,
      description: t.useCases.researchers.description
    },
    {
      icon: Users,
      title: t.useCases.teams.title,
      description: t.useCases.teams.description
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t.useCases.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.useCases.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
          {useCases.map((useCase, index) => (
            <Card key={index} className="hover-scale border-primary/10 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {useCase.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
