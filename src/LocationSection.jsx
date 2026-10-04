import React from "react";
import { MapPin, ArrowUpRight, Navigation } from "lucide-react";
import { CHURCH_LOCATION } from "./church-location.js";

export default function LocationSection() {
  return (
    <section className="location-section">
      <div className="location-copy">
        <span className="eyebrow">COME AS YOU ARE</span>
        <h2>There’s a place for you here.</h2>
        <p>
          Visit St. John’s Church, MA Nagar. We look forward to welcoming you.
        </p>
        <address>
          <span>
            <MapPin size={21} />
          </span>
          <div>
            <strong>St. John’s Church, MA Nagar</strong>
            <p>{CHURCH_LOCATION.address}</p>
          </div>
        </address>
        <div className="location-actions">
          <a
            className="button primary"
            href={CHURCH_LOCATION.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation size={16} />
            Get directions
            <ArrowUpRight size={15} />
          </a>
          <a
            className="text-button"
            href={CHURCH_LOCATION.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Google Maps
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
      <div className="location-map">
        <iframe
          title="St. John’s Church location on Google Maps"
          src={CHURCH_LOCATION.embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a
          href={CHURCH_LOCATION.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="map-open-link"
        >
          <MapPin size={14} />
          St. John’s Church, MA Nagar
          <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
