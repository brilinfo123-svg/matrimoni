"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiSearch,
  FiShield,
  FiLoader,
  FiSliders,
  FiX,
} from "react-icons/fi";

import styles from "./search.module.scss";

import ProfileCard, {
  type Profile,
} from "@/components/ProfileCard/index";

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
  return (
    <div className={styles.filterField}>
      <label>{label}</label>

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

function getAgeRange(value: string) {
  if (value === "Any age") {
    return null;
  }

  const match = value.match(/^(\d+)\s*-\s*(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    min: Number(match[1]),
    max: Number(match[2]),
  };
}
function formatPremiumRemaining(milliseconds: number) {
  if (milliseconds <= 0) {
    return "Premium expired";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
}
type ContactBalance = {
  freeTotal: number;
  freeUsed: number;
  freeRemaining: number;
  contactCredits: number;
  premiumActive: boolean;
  premiumUntil: string | null;
  totalAvailable: number | "unlimited";
  unlockedCount: number;
};

let profilesCache: Profile[] | null = null;
let profilesRequest: Promise<Profile[]> | null = null;

async function getCachedProfiles(
  forceRefresh = false,
): Promise<Profile[]> {
  if (!forceRefresh && profilesCache !== null) {
    return profilesCache;
  }

  if (!forceRefresh && profilesRequest) {
    return profilesRequest;
  }

  const request = (async () => {
    const response = await fetch("/api/users", {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to load profiles",
      );
    }

    const users: Profile[] = Array.isArray(data.users)
      ? data.users
      : [];

    profilesCache = users;

    return users;
  })();

  profilesRequest = request;

  try {
    return await request;
  } finally {
    if (profilesRequest === request) {
      profilesRequest = null;
    }
  }
}

export default function SearchPage() {
  // --------------------------------------------------
  // PROFILES
  // --------------------------------------------------

  const [profiles, setProfiles] = useState<Profile[]>(
    () => profilesCache ?? [],
  );

  const [loading, setLoading] = useState(
    () => profilesCache === null,
  );

  const [error, setError] = useState("");

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Any location");
  const [age, setAge] = useState("Any age");
  const [education, setEducation] = useState("Any education");
  const [profession, setProfession] = useState("Any profession");
  const [maritalStatus, setMaritalStatus] = useState("Any status");
  const [sort, setSort] = useState("Newest");
  const [showUnlockLoader, setShowUnlockLoader] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [shortlisted, setShortlisted] = useState<string[]>([]);

  // --------------------------------------------------
  // DYNAMIC CONTACT SYSTEM
  // --------------------------------------------------

  const [contactBalance, setContactBalance] = useState<ContactBalance | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
  
    return () => window.clearInterval(timer);
  }, []);
  const [unlockedContacts, setUnlockedContacts] = useState<string[]>([]);

  const [showContactPlans, setShowContactPlans] = useState(false);

  const [contactLoading, setContactLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);

  const premiumActive = contactBalance?.premiumActive ?? false;
  const premiumRemaining = contactBalance?.premiumUntil ? new Date(contactBalance.premiumUntil).getTime() - currentTime: 0;
  const premiumCountdown = formatPremiumRemaining(premiumRemaining,);
  const contactsRemaining = premiumActive ? "Unlimited" : contactBalance? contactBalance.freeRemaining + contactBalance.contactCredits: "...";

  // --------------------------------------------------
  // LOAD CONTACT BALANCE + UNLOCKED PROFILES
  // --------------------------------------------------

  const loadContactData = async () => {
    try {
      setContactLoading(true);

      const [balanceResponse, unlockedResponse] =
        await Promise.all([
          fetch("/api/contacts/balance", {
            method: "GET",
            cache: "no-store",
          }),

          fetch("/api/contacts/unlocked", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

      const balanceData = await balanceResponse.json();
      const unlockedData = await unlockedResponse.json();

      if (!balanceResponse.ok || !balanceData.success) {
        throw new Error(
          balanceData.message || "Unable to load contact balance",
        );
      }

      if (!unlockedResponse.ok || !unlockedData.success) {
        throw new Error(
          unlockedData.message || "Unable to load unlocked contacts",
        );
      }

      setContactBalance(balanceData.balance);

      const unlockedIds = Array.isArray(unlockedData.profiles)
        ? unlockedData.profiles
            .map((profile: Profile) => profile.id)
            .filter((id: string) => Boolean(id))
        : [];

      setUnlockedContacts(unlockedIds);
    } catch (error) {
      console.error("CONTACT_DATA_ERROR:", error);
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    void loadContactData();
  }, []);

  // --------------------------------------------------
  // LOAD PROFILES
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadProfiles() {
      try {
        setError("");

        if (profilesCache !== null) {
          setProfiles(profilesCache);
          setLoading(false);
          return;
        }

        setLoading(true);

        const users = await getCachedProfiles();

        if (active) {
          setProfiles(users);
        }
      } catch (error) {
        console.error("FETCH_PROFILES_ERROR:", error);

        if (active) {
          setError(
            "Unable to load profiles. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfiles();

    return () => {
      active = false;
    };
  }, []);

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError("");

      const users = await getCachedProfiles(true);

      setProfiles(users);
    } catch (error) {
      console.error("RETRY_PROFILES_ERROR:", error);

      setError("Unable to load profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UNLOCK CONTACT
  // --------------------------------------------------

  const handleUnlockContact = async (
    profile: Profile,
  ): Promise<string | null> => {
    let loaderStartTime = 0;
  
    try {
      const response = await fetch("/api/contacts/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.id,
        }),
      });
  
      const data = await response.json();
  
      // Limit khatam: direct Upgrade dialog, no loader
      if (response.status === 402) {
        await loadContactData();
        setShowContactPlans(true);
        return null;
      }
  
      if (!response.ok || !data.success) {
        if (response.status === 401) {
          alert("Please login to unlock contact details.");
        } else {
          alert(data.message || "Unable to unlock contact details.");
        }
  
        return null;
      }
  
      const mobile = data.profile?.mobile;
  
      if (!mobile) {
        alert("Contact number is not available for this profile.");
        return null;
      }
  
      // Successful unlock: show loader for minimum 2 seconds
      loaderStartTime = Date.now();
      setShowUnlockLoader(true);
  
      setUnlockedContacts((current) =>
        current.includes(profile.id)
          ? current
          : [...current, profile.id],
      );
  
      await loadContactData();
  
      return String(mobile);
    } catch (error) {
      console.error("UNLOCK_CONTACT_ERROR:", error);
      alert("Something went wrong while unlocking this contact.");
      return null;
    } finally {
      // Only wait and hide loader if it was actually started
      if (loaderStartTime > 0) {
        const elapsed = Date.now() - loaderStartTime;
        const remainingTime = Math.max(0, 2000 - elapsed);
  
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remainingTime);
        });
  
        setShowUnlockLoader(false);
      }
    }
  };
  

  // --------------------------------------------------
  // DEMO PLAN ACTIVATION
  // --------------------------------------------------

  const activatePlan = async (
    plan: "contact_pack" | "monthly",
  ) => {
    try {
      setPlanLoading(true);

      const response = await fetch("/api/contacts/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message || "Unable to activate this plan.",
        );
        return;
      }

      // Refresh MongoDB balance
      await loadContactData();

      setShowContactPlans(false);

      alert(
        plan === "contact_pack"
          ? "20 contact credits added successfully!"
          : "Monthly Premium activated successfully!",
      );
    } catch (error) {
      console.error("ACTIVATE_PLAN_ERROR:", error);

      alert("Something went wrong while activating your plan.");
    } finally {
      setPlanLoading(false);
    }
  };

  const buyContactPackDemo = () => {
    void activatePlan("contact_pack");
  };

  const buyPremiumDemo = () => {
    void activatePlan("monthly");
  };

  // --------------------------------------------------
  // FILTER OPTIONS FROM DATABASE
  // --------------------------------------------------

  const locationOptions = useMemo(() => {
    const locations = profiles
      .map((profile) => profile.city)
      .filter(Boolean);

    return [
      "Any location",
      ...Array.from(new Set(locations)).sort(),
    ];
  }, [profiles]);

  const educationOptions = useMemo(() => {
    const values = profiles
      .map((profile) => profile.education)
      .filter(Boolean);

    return [
      "Any education",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [profiles]);

  const professionOptions = useMemo(() => {
    const values = profiles
      .map((profile) => profile.profession)
      .filter(Boolean);

    return [
      "Any profession",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [profiles]);

  const maritalStatusOptions = useMemo(() => {
    const values = profiles
      .map((profile) => profile.maritalStatus)
      .filter(Boolean);

    return [
      "Any status",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [profiles]);

  const ageOptions = useMemo(() => {
    const ages = profiles
      .map((profile) => profile.age)
      .filter(
        (profileAge): profileAge is number =>
          typeof profileAge === "number",
      );

    if (ages.length === 0) {
      return ["Any age"];
    }

    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    const options = ["Any age"];

    const start = Math.floor(minAge / 5) * 5;
    const end = Math.ceil(maxAge / 5) * 5;

    for (
      let current = start;
      current < end;
      current += 5
    ) {
      options.push(`${current} - ${current + 4}`);
    }

    return options;
  }, [profiles]);

  // --------------------------------------------------
  // FILTER PROFILES
  // --------------------------------------------------

  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((profile) => {
        const searchableText = [
          profile.name,
          profile.profession,
          profile.location,
          profile.education,
          profile.religion,
          profile.motherTongue,
          profile.company,
          profile.college,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Location
    if (location !== "Any location") {
      result = result.filter(
        (profile) => profile.city === location,
      );
    }

    // Age
    const selectedAgeRange = getAgeRange(age);

    if (selectedAgeRange) {
      result = result.filter((profile) => {
        if (profile.age === null) {
          return false;
        }

        return (
          profile.age >= selectedAgeRange.min &&
          profile.age <= selectedAgeRange.max
        );
      });
    }

    // Education
    if (education !== "Any education") {
      result = result.filter(
        (profile) => profile.education === education,
      );
    }

    // Profession
    if (profession !== "Any profession") {
      result = result.filter(
        (profile) => profile.profession === profession,
      );
    }

    // Marital status
    if (maritalStatus !== "Any status") {
      result = result.filter(
        (profile) => profile.maritalStatus === maritalStatus,
      );
    }

    // Verified profiles
    if (verifiedOnly) {
      result = result.filter(
        (profile) => profile.verified,
      );
    }

    // Sorting
    if (sort === "Newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateB - dateA;
      });
    }

    return result;
  }, [
    profiles,
    search,
    location,
    age,
    education,
    profession,
    maritalStatus,
    verifiedOnly,
    sort,
  ]);

  // --------------------------------------------------
  // SHORTLIST
  // --------------------------------------------------

  const toggleShortlist = (id: string) => {
    setShortlisted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setLocation("Any location");
    setAge("Any age");
    setEducation("Any education");
    setProfession("Any profession");
    setMaritalStatus("Any status");
    setSort("Newest");
    setVerifiedOnly(false);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        <header className={styles.pageHeader}>
          <div>
            <h1>Find meaningful connections</h1>

            <p>
              Explore profiles based on your preferences,
              compatibility, and shared interests.
            </p>

            <div className={styles.contactBalance}>
              <div>
                <span>
                  {contactLoading
                    ? "Loading contact balance..."
                    : "Contact balance"}
                </span>

                <strong>
                  {premiumActive
                    ? "Unlimited contacts for"
                    : `${contactsRemaining} contacts remaining`}
                </strong>

                 {premiumActive && contactBalance?.premiumUntil && (
                    <small className={styles.premiumCountdown}>
                      {premiumCountdown === "Premium expired"
                        ? "Premium expired"
                        : `${premiumCountdown}`}
                    </small>
                  )}
              </div>

              <button
                type="button"
                onClick={() => setShowContactPlans(true)}
              >
                Get more contacts
              </button>
            </div>
          </div>
        </header>

        {/* SEARCH */}
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
          {/* FILTER SIDEBAR */}
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
                options={locationOptions}
                onChange={setLocation}
              />

              <FilterSelect
                label="Age range"
                value={age}
                options={ageOptions}
                onChange={setAge}
              />

              <FilterSelect
                label="Education"
                value={education}
                options={educationOptions}
                onChange={setEducation}
              />

              <FilterSelect
                label="Profession"
                value={profession}
                options={professionOptions}
                onChange={setProfession}
              />

              <FilterSelect
                label="Marital status"
                value={maritalStatus}
                options={maritalStatusOptions}
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

          {/* PROFILE RESULTS */}
          <main className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <strong>
                  {loading
                    ? "Loading..."
                    : filteredProfiles.length}
                </strong>

                {!loading && (
                  <span>
                    {" "}
                    profiles matching your preferences
                  </span>
                )}
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
                    <option>Newest</option>
                    <option>Best match</option>
                  </select>

                  <FiChevronDown aria-hidden="true" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FiSearch aria-hidden="true" />
                </div>

                <h2>Loading profiles...</h2>

                <p>
                  Please wait while we find profiles for you.
                </p>
              </div>
            ) : error ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FiX aria-hidden="true" />
                </div>

                <h2>Something went wrong</h2>

                <p>{error}</p>

                <button
                  type="button"
                  onClick={handleRetry}
                >
                  Try again
                </button>
              </div>
            ) : filteredProfiles.length > 0 ? (
              <>
                <div className={styles.profileGrid}>
                  {filteredProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      shortlisted={shortlisted.includes(profile.id)}
                      onShortlist={() =>
                        toggleShortlist(profile.id)
                      }
                      contactUnlocked={unlockedContacts.includes(
                        profile.id,
                      )}
                      onUnlockContact={handleUnlockContact}
                    />
                  ))}
                </div>

                <div className={styles.loadMore}>
                  <button type="button" disabled>
                    All profiles loaded
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

      {/* CONTACT UNLOCK LOADING MODAL */}
      {showUnlockLoader && (
        <div className={styles.unlockModalOverlay}>
          <div
            className={styles.unlockModal}
            role="status"
            aria-live="polite"
          >
            <div className={styles.unlockLoaderIcon}>
              <FiLoader className={styles.unlockSpinner} />
              <span className={styles.unlockLoaderCheck}>
                <FiCheck />
              </span>
            </div>

            <h2>Unlocking Contact</h2>

            <p>
              Please wait while we securely retrieve the contact details.
            </p>

            <div className={styles.unlockProgress}>
              <span />
            </div>

            <small>Preparing your connection...</small>
          </div>
        </div>
      )}

      {/* CONTACT PLANS MODAL */}
      {showContactPlans && (
        <div className={styles.contactModalOverlay}>
          <div
            className={styles.contactModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contactModalTitle"
          >
            <button
              type="button"
              className={styles.contactModalClose}
              onClick={() => setShowContactPlans(false)}
              aria-label="Close plans"
              disabled={planLoading}
            >
              <FiX />
            </button>

            <span className={styles.contactModalEyebrow}>
              EverMilan Membership
            </span>

            <h2 id="contactModalTitle">
              Connect with the right people
            </h2>

            <p>
              Unlock contact details and take the next step
              towards a meaningful connection.
            </p>

            {/* CONTACT PACK */}
            <div className={styles.contactPlan}>
              <div>
                <h3>Contact Pack</h3>

                <strong>₹50</strong>

                <p>20 additional contact unlocks</p>
              </div>

              <button
                type="button"
                onClick={buyContactPackDemo}
                disabled={planLoading}
              >
                {planLoading
                  ? "Activating..."
                  : "Get 20 contacts"}
              </button>
            </div>

            {/* PREMIUM */}
            <div
              className={`${styles.contactPlan} ${styles.premiumPlan}`}
            >
              <div>
                <span className={styles.premiumLabel}>
                  BEST VALUE
                </span>

                <h3>Monthly Premium</h3>

                <strong>₹100</strong>

                <p>Unlimited contacts for 30 days</p>
              </div>

              <button
                type="button"
                onClick={buyPremiumDemo}
                disabled={planLoading}
              >
                {planLoading
                  ? "Activating..."
                  : "Get Premium"}
              </button>
            </div>

            <small className={styles.demoNotice}>
              Demo mode: No real payment will be charged.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}