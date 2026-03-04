import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type InfoSection = {
  heading: string;
  points: string[];
};

type InfoPageProps = {
  title: string;
  intro: string;
  sections: InfoSection[];
};

function InfoPage({ title, intro, sections }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display font-bold text-2xl lg:text-3xl mb-3">{title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{intro}</p>

          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.heading} className="border border-border bg-card p-5">
                <h2 className="font-display font-semibold text-lg mb-3">{section.heading}</h2>
                <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ContactUsPage() {
  return (
    <InfoPage
      title="Contact Us"
      intro="Our support team is available every day to help with orders, fitment checks, returns, and technical product questions."
      sections={[
        {
          heading: 'Support Channels',
          points: [
            'Email: support@bikershub.in (responses within 24 hours).',
            'Phone: +91 90000 00000 (10:00 AM to 7:00 PM IST).',
            'WhatsApp support available for quick order and shipping assistance.',
          ],
        },
        {
          heading: 'What to Include in Your Message',
          points: [
            'Order ID for order-related questions.',
            'Bike make/model/year for compatibility checks.',
            'Clear photos if reporting a damaged or incorrect item.',
          ],
        },
      ]}
    />
  );
}

export function FaqsPage() {
  return (
    <InfoPage
      title="FAQs"
      intro="Quick answers to common questions from riders before and after purchase."
      sections={[
        {
          heading: 'Orders & Payments',
          points: [
            'We accept UPI, cards, net banking, and cash on delivery where available.',
            'Orders can be canceled before dispatch from your order confirmation email.',
            'Discount codes can be applied during checkout in the coupon section.',
          ],
        },
        {
          heading: 'Products & Fitment',
          points: [
            'Use size charts on product pages for accurate sizing.',
            'For bike-specific parts, confirm compatibility before placing your order.',
            'Helmet and riding gear safety ratings are listed in product details where applicable.',
          ],
        },
      ]}
    />
  );
}

export function ShippingInfoPage() {
  return (
    <InfoPage
      title="Shipping Info"
      intro="We ship across India with reliable courier partners and regular tracking updates."
      sections={[
        {
          heading: 'Delivery Timelines',
          points: [
            'Metro cities: 2-4 business days after dispatch.',
            'Non-metro and remote regions: 4-7 business days.',
            'Delivery timelines may vary during sales or extreme weather.',
          ],
        },
        {
          heading: 'Shipping Charges',
          points: [
            'Free shipping on orders above ₹999.',
            'A standard shipping charge applies for smaller orders.',
            'Final shipping cost is shown at checkout before payment.',
          ],
        },
      ]}
    />
  );
}

export function ReturnsPage() {
  return (
    <InfoPage
      title="Returns"
      intro="If something is not right, we offer a straightforward return process for eligible items."
      sections={[
        {
          heading: 'Eligibility',
          points: [
            'Return request must be raised within 7 days of delivery.',
            'Item should be unused, unwashed, and in original packaging.',
            'Products marked non-returnable on the product page are excluded.',
          ],
        },
        {
          heading: 'How Returns Work',
          points: [
            'Submit your request with order ID and reason for return.',
            'Our team schedules pickup where serviceable; otherwise self-ship instructions are shared.',
            'Refunds are processed after quality check to your original payment method.',
          ],
        },
      ]}
    />
  );
}

export function SizeGuidePage() {
  return (
    <InfoPage
      title="Size Guide"
      intro="Correct fit is essential for comfort and protection. Use these steps before buying riding gear."
      sections={[
        {
          heading: 'How to Measure',
          points: [
            'Helmets: Measure head circumference 2 cm above eyebrows.',
            'Jackets: Measure chest at the widest point with relaxed posture.',
            'Gloves: Measure palm circumference without including thumb.',
          ],
        },
        {
          heading: 'Fit Tips',
          points: [
            'Choose snug, secure fit for protective gear; avoid loose armor movement.',
            'If between sizes, check product-specific recommendation on each page.',
            'Contact support for sizing help before placing your order.',
          ],
        },
      ]}
    />
  );
}

export function TrackOrderPage() {
  return (
    <InfoPage
      title="Track Order"
      intro="Use your order details to stay updated from packing to final delivery."
      sections={[
        {
          heading: 'Tracking Methods',
          points: [
            'Open your order confirmation email and click the tracking link.',
            'Visit your account profile to view current order status and tracking ID.',
            'Contact support if status has not changed for more than 48 hours.',
          ],
        },
        {
          heading: 'Status Meaning',
          points: [
            'Processing: Order is being packed and prepared for dispatch.',
            'Shipped: Package has been handed to logistics partner.',
            'Delivered: Package successfully delivered at destination.',
          ],
        },
      ]}
    />
  );
}

export function RidersBlogPage() {
  return (
    <InfoPage
      title="Rider's Blog"
      intro="Stories, ride diaries, route highlights, and practical biking tips from our community."
      sections={[
        {
          heading: 'Latest Topics',
          points: [
            'Monsoon riding essentials and rain-proof gear picks.',
            'Weekend ride route ideas with safety and fuel stops.',
            'Beginner riding mistakes and how to avoid them.',
          ],
        },
        {
          heading: 'Community Features',
          points: [
            'Guest stories from riders across India.',
            'Monthly spotlight on custom builds and touring setups.',
            'Photo submissions and safety-first ride experiences.',
          ],
        },
      ]}
    />
  );
}

export function BuyingGuidesPage() {
  return (
    <InfoPage
      title="Buying Guides"
      intro="Detailed recommendations to help you choose the right gear and accessories for your riding style."
      sections={[
        {
          heading: 'Popular Guides',
          points: [
            'How to pick your first full-face helmet.',
            'Choosing riding jackets by weather and protection level.',
            'Tyre buying guide for city, touring, and mixed road use.',
          ],
        },
        {
          heading: 'Selection Framework',
          points: [
            'Prioritize safety certifications and fit over visual design alone.',
            'Match products to your ride type: commute, touring, or off-road.',
            'Balance durability, warranty support, and long-term value.',
          ],
        },
      ]}
    />
  );
}

export function GearReviewsPage() {
  return (
    <InfoPage
      title="Gear Reviews"
      intro="Independent-style reviews and rider-tested feedback to help you compare before buying."
      sections={[
        {
          heading: 'Review Format',
          points: [
            'Each review covers fit, comfort, build quality, and real-use performance.',
            'Pros and limitations are listed clearly for practical comparison.',
            'Long-term durability notes are updated based on rider feedback.',
          ],
        },
        {
          heading: 'What We Review',
          points: [
            'Helmets, riding jackets, gloves, boots, and luggage systems.',
            'Maintenance accessories and motorcycle care products.',
            'Commuter and touring-focused upgrades for popular bike models.',
          ],
        },
      ]}
    />
  );
}

export function AffiliatePage() {
  return (
    <InfoPage
      title="Affiliate"
      intro="Partner with BikersHub and earn commission by sharing products with your riding audience."
      sections={[
        {
          heading: 'Program Benefits',
          points: [
            'Competitive commission rates on successful referrals.',
            'Access to seasonal creatives and campaign support.',
            'Performance dashboard for clicks, conversions, and payouts.',
          ],
        },
        {
          heading: 'How to Join',
          points: [
            'Apply with your social/profile details and audience information.',
            'Our team reviews and approves applications within 5 business days.',
            'Once approved, start promoting using your unique tracking links.',
          ],
        },
      ]}
    />
  );
}

export function PressPage() {
  return (
    <InfoPage
      title="Press"
      intro="Media resources, company updates, and collaboration details for journalists and publications."
      sections={[
        {
          heading: 'Media Inquiries',
          points: [
            'Press contact: media@bikershub.in for interviews and statements.',
            'Include publication name, topic, and expected timeline in your request.',
            'High-resolution logos and brand assets are available on request.',
          ],
        },
        {
          heading: 'Coverage Areas',
          points: [
            'Product launches and rider safety initiatives.',
            'Partnership announcements and community ride programs.',
            'Industry insights on motorcycle gear and accessory trends in India.',
          ],
        },
      ]}
    />
  );
}
