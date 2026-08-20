/* eslint-disable prettier/prettier */
import comingSoonImg from "@/assets/logos/coming.jpg";

export function PortalComingSoon() {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <img
        src={comingSoonImg}
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}
