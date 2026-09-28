"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
FiCheck,
FiChevronDown,
FiFilter,
FiHeart,
FiMapPin,
FiMessageCircle,
FiSearch,
FiShield,
FiSliders,
FiStar,
FiUser,
FiX,
} from "react-icons/fi";

import styles from "./search.module.scss";

type Profile = {
id: string;
name: string;
age: number;
location: string;
profession: string;
education: string;
compatibility: number;
initials: string;
verified: boolean;
online: boolean;
height: string;
maritalStatus: string;
};

const profiles: Profile[] = [
{
id: "ananya-sharma",
name: "Ananya Sharma",
age: 28,
location: "Toronto, Canada",
profession: "Product Designer",
education: "Master's Degree",
compatibility: 94,
initials: "AS",
verified: true,
online: true,
height: "5'5",
maritalStatus: "Never married",
},
{
id: "priya-mehta",
name: "Priya Mehta",
age: 27,
location: "Vancouver, Canada",
profession: "Software Engineer",
education: "Bachelor's Degree",
compatibility: 91,
initials: "PM",
verified: true,
online: false,
height: "5'4",
maritalStatus: "Never married",
},
{
id: "meera-kapoor",
name: "Meera Kapoor",
age: 29,
location: "Brampton, Canada",
profession: "Marketing Manager",
education: "Master's Degree",
compatibility: 88,
initials: "MK",
verified: true,
online: true,
height: "5'6",
maritalStatus: "Never married",
},
{
id: "riya-patel",
name: "Riya Patel",
age: 26,
location: "Mississauga, Canada",
profession: "Financial Analyst",
education: "Bachelor's Degree",
compatibility: 86,
initials: "RP",
verified: false,
online: false,
height: "5'3",
maritalStatus: "Never married",
},
{
id: "neha-verma",
name: "Neha Verma",
age: 30,
location: "Ottawa, Canada",
profession: "HR Manager",
education: "Master's Degree",
compatibility: 84,
initials: "NV",
verified: true,
online: true,
height: "5'5",
maritalStatus: "Never married",
},
{
id: "simran-kaur",
name: "Simran Kaur",
age: 28,
location: "Calgary, Canada",
profession: "Business Analyst",
education: "Bachelor's Degree",
compatibility: 82,
initials: "SK",
verified: true,
online: false,
height: "5'6",
maritalStatus: "Never married",
},
];

function FilterSelect({
label,
value,
options,
onChange,
}: {
label: string;
value: string;
options: string[];
onChange: (value: string) => void;
}) {
return ( <div className={styles.filterField}> <label>{label}</label>


  <div className={styles.selectWrapper}>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>

    <FiChevronDown aria-hidden="true" />
  </div>
</div>

);
}

function ProfileCard({
profile,
shortlisted,
onShortlist,
}: {
profile: Profile;
shortlisted: boolean;
onShortlist: () => void;
}) {
return ( <article className={styles.profileCard}>
<Link
href={`/profile/${profile.id}`}
className={styles.profileImageLink}
aria-label={`View ${profile.name}'s profile`}
> <div className={styles.profileImage}> <span>{profile.initials}</span>


      {profile.online && (
        <span className={styles.onlineBadge}>
          <span />
          Online
        </span>
      )}

      <div className={styles.compatibility}>
        <FiStar aria-hidden="true" />
        <strong>{profile.compatibility}%</strong>
        <span>match</span>
      </div>
    </div>
  </Link>

  <div className={styles.profileContent}>
    <div className={styles.profileNameRow}>
      <Link
        href={`/profile/${profile.id}`}
        className={styles.profileName}
      >
        {profile.name}
      </Link>

      {profile.verified && (
        <span
          className={styles.verifiedIcon}
          title="Verified profile"
        >
          <FiCheck aria-hidden="true" />
        </span>
      )}
    </div>

    <p className={styles.profileMeta}>
      {profile.age} years
      <span>•</span>
      {profile.profession}
    </p>

    <div className={styles.profileLocation}>
      <FiMapPin aria-hidden="true" />
      <span>{profile.location}</span>
    </div>

    <div className={styles.profileDetails}>
      <span>{profile.education}</span>
      <span>{profile.height}</span>
      <span>{profile.maritalStatus}</span>
    </div>

    <div className={styles.cardActions}>
      <button
        type="button"
        className={`${styles.shortlistButton} ${
          shortlisted ? styles.shortlisted : ""
        }`}
        onClick={onShortlist}
        aria-label={
          shortlisted
            ? `Remove ${profile.name} from shortlist`
            : `Add ${profile.name} to shortlist`
        }
      >
        <FiHeart
          aria-hidden="true"
          fill={shortlisted ? "currentColor" : "none"}
        />
      </button>

      <Link
        href={`/profile/${profile.id}`}
        className={styles.viewButton}
      >
        View profile
      </Link>

      <Link
        href="/dashboard/messages"
        className={styles.messageButton}
        aria-label={`Message ${profile.name}`}
      >
        <FiMessageCircle aria-hidden="true" />
      </Link>
    </div>
  </div>
</article>

);
}

export default function SearchPage() {
const [search, setSearch] = useState("");
const [location, setLocation] = useState("Any location");
const [age, setAge] = useState("25 - 32");
const [education, setEducation] = useState("Any education");
const [profession, setProfession] = useState("Any profession");
const [maritalStatus, setMaritalStatus] =
useState("Never married");
const [sort, setSort] = useState("Best match");
const [verifiedOnly, setVerifiedOnly] = useState(false);
const [showFilters, setShowFilters] = useState(false);
const [shortlisted, setShortlisted] = useState<string[]>([]);

const filteredProfiles = useMemo(() => {
let result = [...profiles];

if (search.trim()) {
  const query = search.toLowerCase();

  result = result.filter(
    (profile) =>
      profile.name.toLowerCase().includes(query) ||
      profile.profession.toLowerCase().includes(query) ||
      profile.location.toLowerCase().includes(query),
  );
}

if (location !== "Any location") {
  result = result.filter((profile) =>
    profile.location.includes(location),
  );
}

if (education !== "Any education") {
  result = result.filter(
    (profile) => profile.education === education,
  );
}

if (profession !== "Any profession") {
  result = result.filter(
    (profile) => profile.profession === profession,
  );
}

if (maritalStatus !== "Any status") {
  result = result.filter(
    (profile) =>
      profile.maritalStatus === maritalStatus,
  );
}

if (verifiedOnly) {
  result = result.filter((profile) => profile.verified);
}

if (sort === "Highest match") {
  result.sort(
    (a, b) => b.compatibility - a.compatibility,
  );
}

if (sort === "Newest") {
  result.reverse();
}

return result;

}, [
search,
location,
education,
profession,
maritalStatus,
verifiedOnly,
sort,
]);

const toggleShortlist = (id: string) => {
setShortlisted((current) =>
current.includes(id)
? current.filter((item) => item !== id)
: [...current, id],
);
};

const resetFilters = () => {
setSearch("");
setLocation("Any location");
setAge("25 - 32");
setEducation("Any education");
setProfession("Any profession");
setMaritalStatus("Never married");
setSort("Best match");
setVerifiedOnly(false);
};

return ( <div className={styles.page}> <div className={styles.backgroundGlow} /> <div className={styles.backgroundGlowTwo} />
  <div className="container">
    <header className={styles.pageHeader}>
      <div>
        <span className={styles.eyebrow}>
          Discover
        </span>

        <h1>Find meaningful connections</h1>

        <p>
          Explore profiles based on your preferences,
          compatibility, and shared interests.
        </p>
      </div>

      <Link
        href="/profile"
        className={styles.profileButton}
      >
        <FiUser aria-hidden="true" />
        <span>My profile</span>
      </Link>
    </header>

    <section className={styles.searchPanel}>
      <div className={styles.searchBox}>
        <FiSearch
          className={styles.searchIcon}
          aria-hidden="true"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name, profession or location..."
          aria-label="Search profiles"
        />

        {search && (
          <button
            type="button"
            className={styles.clearSearch}
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      <button
        type="button"
        className={styles.mobileFilterButton}
        onClick={() => setShowFilters(true)}
      >
        <FiSliders aria-hidden="true" />
        <span>Filters</span>
      </button>
    </section>

    <div className={styles.contentLayout}>
      <aside
        className={`${styles.filtersSidebar} ${
          showFilters ? styles.filtersOpen : ""
        }`}
      >
        <div className={styles.filterMobileHeader}>
          <div>
            <span>Refine results</span>
            <strong>Filters</strong>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(false)}
            aria-label="Close filters"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className={styles.filterHeading}>
          <div>
            <FiFilter aria-hidden="true" />
            <h2>Refine your search</h2>
          </div>

          <button
            type="button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        <div className={styles.filters}>
          <FilterSelect
            label="Location"
            value={location}
            options={[
              "Any location",
              "Toronto",
              "Vancouver",
              "Brampton",
              "Mississauga",
              "Ottawa",
              "Calgary",
            ]}
            onChange={setLocation}
          />

          <FilterSelect
            label="Age range"
            value={age}
            options={[
              "25 - 32",
              "21 - 25",
              "26 - 30",
              "31 - 35",
              "36 - 40",
            ]}
            onChange={setAge}
          />

          <FilterSelect
            label="Education"
            value={education}
            options={[
              "Any education",
              "Bachelor's Degree",
              "Master's Degree",
              "Doctorate",
            ]}
            onChange={setEducation}
          />

          <FilterSelect
            label="Profession"
            value={profession}
            options={[
              "Any profession",
              "Product Designer",
              "Software Engineer",
              "Marketing Manager",
              "Financial Analyst",
              "HR Manager",
              "Business Analyst",
            ]}
            onChange={setProfession}
          />

          <FilterSelect
            label="Marital status"
            value={maritalStatus}
            options={[
              "Never married",
              "Any status",
              "Divorced",
              "Widowed",
            ]}
            onChange={setMaritalStatus}
          />

          <label className={styles.checkOption}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) =>
                setVerifiedOnly(event.target.checked)
              }
            />

            <span className={styles.customCheck}>
              <FiCheck aria-hidden="true" />
            </span>

            <span>
              <strong>Verified profiles only</strong>
              <small>
                Show profiles with verification
              </small>
            </span>
          </label>
        </div>

        <div className={styles.filterBottom}>
          <div>
            <FiShield aria-hidden="true" />
            <span>
              You control what information you share.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(false)}
          >
            Show results
          </button>
        </div>
      </aside>

      {showFilters && (
        <button
          type="button"
          className={styles.filterOverlay}
          onClick={() => setShowFilters(false)}
          aria-label="Close filter panel"
        />
      )}

      <main className={styles.results}>
        <div className={styles.resultsHeader}>
          <div>
            <strong>
              {filteredProfiles.length} profiles
            </strong>
            <span> matching your preferences</span>
          </div>

          <div className={styles.sortWrapper}>
            <span>Sort by</span>

            <div>
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                aria-label="Sort profiles"
              >
                <option>Best match</option>
                <option>Highest match</option>
                <option>Newest</option>
              </select>

              <FiChevronDown aria-hidden="true" />
            </div>
          </div>
        </div>

        {filteredProfiles.length > 0 ? (
          <>
            <div className={styles.profileGrid}>
              {filteredProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  shortlisted={shortlisted.includes(
                    profile.id,
                  )}
                  onShortlist={() =>
                    toggleShortlist(profile.id)
                  }
                />
              ))}
            </div>

            <div className={styles.loadMore}>
              <button type="button">
                Load more profiles
              </button>

              <span>
                Showing {filteredProfiles.length} of{" "}
                {profiles.length} profiles
              </span>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiSearch aria-hidden="true" />
            </div>

            <h2>No profiles found</h2>

            <p>
              Try changing your filters or search for
              something different.
            </p>

            <button
              type="button"
              onClick={resetFilters}
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  </div>
</div>
);
}
