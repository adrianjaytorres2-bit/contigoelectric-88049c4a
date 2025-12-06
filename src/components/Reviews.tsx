import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { reviews } from "@/data/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-star-yellow text-star-yellow" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colors = {
    yelp: "bg-yelp-red text-foreground",
    google: "bg-blue-600 text-foreground",
    buildzoom: "bg-primary text-primary-foreground",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[source as keyof typeof colors]}`}>
      {source === "buildzoom" ? "BuildZoom" : source.charAt(0).toUpperCase() + source.slice(1)}
    </span>
  );
}

export function Reviews() {
  return (
    <section id="reviews" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground mb-3 md:mb-4">CLIENT REVIEWS</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-6 px-2">
            See what our clients are saying about their experience working with Contigo Electric.
          </p>
          
          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-card rounded-lg border border-border">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 md:w-6 md:h-6 fill-star-yellow text-star-yellow" />
                ))}
              </div>
              <div className="text-left">
                <div className="font-display text-xl md:text-2xl text-foreground">5.0</div>
                <div className="text-[10px] md:text-xs text-muted-foreground">Average Rating</div>
              </div>
            </div>
            <a
              href="https://www.yelp.com/biz/contigo-electric-oviedo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-yelp-red text-foreground rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
            >
              <span className="font-medium">View on Yelp</span>
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
            </a>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-medium text-sm md:text-base">
                          {review.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm md:text-base">{review.author}</div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">{review.date}</div>
                      </div>
                    </div>
                    <SourceBadge source={review.source} />
                  </div>
                  
                  <StarRating rating={review.rating} />
                  
                  {review.projectType && (
                    <div className="mt-2 md:mt-3 mb-2">
                      <span className="text-[10px] md:text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">
                        {review.projectType}
                      </span>
                    </div>
                  )}
                  
                  <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-4 md:line-clamp-none">
                    "{review.text}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10 md:mt-16"
        >
          <p className="text-sm md:text-base text-muted-foreground mb-4 px-2">
            Have you worked with Contigo Electric? We'd love to hear about your experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 flex-wrap">
            <a
              href="https://www.google.com/search?q=contigo+electric+oviedo+review"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Write a Google Review
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
            </a>
            <a
              href="https://www.yelp.com/writeareview/biz/contigo-electric-oviedo"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-yelp-red text-foreground rounded-lg hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Write a Yelp Review
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
            </a>
            <a
              href="https://www.buildzoom.com/contractor/contigo-electric#write_review"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Write a BuildZoom Review
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
