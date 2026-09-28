"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiSearch,
  FiShield,
  FiSliders,
  FiUser,
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
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
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

  const match = value.match(
    /^(\d+)\s*-\s*(\d+)$/,
  );

  if (!match) {
    return null;
  }

  return {
    min: Number(match[1]),
    max: Number(match[2]),
  };
}

export default function SearchPage() {
  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [location, setLocation] =
    useState("Any location");

  const [age, setAge] =
    useState("Any age");

  const [education, setEducation] =
    useState("Any education");

  const [profession, setProfession] =
    useState("Any profession");

  const [maritalStatus, setMaritalStatus] =
    useState("Any status");

  const [sort, setSort] =
    useState("Newest");

  const [verifiedOnly, setVerifiedOnly] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const [shortlisted, setShortlisted] =
    useState<string[]>([]);

  /*
   * Fetch users from MongoDB API
   */
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/users",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch profiles",
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to load profiles",
          );
        }

        setProfiles(data.users || []);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load profiles. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  /*
   * Generate filter options from
   * actual MongoDB data.
   */
  const locationOptions = useMemo(() => {
    const locations = profiles
      .map((profile) => profile.city)
      .filter(Boolean);

    return [
      "Any location",
      ...Array.from(
        new Set(locations),
      ).sort(),
    ];
  }, [profiles]);

  const educationOptions = useMemo(() => {
    const values = profiles
      .map(
        (profile) =>
          profile.education,
      )
      .filter(Boolean);

    return [
      "Any education",
      ...Array.from(
        new Set(values),
      ).sort(),
    ];
  }, [profiles]);

  const professionOptions = useMemo(() => {
    const values = profiles
      .map(
        (profile) =>
          profile.profession,
      )
      .filter(Boolean);

    return [
      "Any profession",
      ...Array.from(
        new Set(values),
      ).sort(),
    ];
  }, [profiles]);

  const maritalStatusOptions =
    useMemo(() => {
      const values = profiles
        .map(
          (profile) =>
            profile.maritalStatus,
        )
        .filter(Boolean);

      return [
        "Any status",
        ...Array.from(
          new Set(values),
        ).sort(),
      ];
    }, [profiles]);

  /*
   * Dynamic age options based on
   * actual database profiles.
   */
  const ageOptions = useMemo(() => {
    const ages = profiles
      .map((profile) => profile.age)
      .filter(
        (age): age is number =>
          typeof age === "number",
      );

    if (ages.length === 0) {
      return ["Any age"];
    }

    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    const options = [
      "Any age",
    ];

    const start =
      Math.floor(minAge / 5) * 5;

    const end =
      Math.ceil(maxAge / 5) * 5;

    for (
      let current = start;
      current < end;
      current += 5
    ) {
      options.push(
        `${current} - ${current + 4}`,
      );
    }

    return options;
  }, [profiles]);

  /*
   * Filtering
   */
  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    /*
     * Search
     */
    if (search.trim()) {
      const query =
        search.toLowerCase().trim();

      result = result.filter(
        (profile) => {
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

          return searchableText.includes(
            query,
          );
        },
      );
    }

    /*
     * Location
     */
    if (
      location !== "Any location"
    ) {
      result = result.filter(
        (profile) =>
          profile.city === location,
      );
    }

    /*
     * Age
     */
    const selectedAgeRange =
      getAgeRange(age);

    if (selectedAgeRange) {
      result = result.filter(
        (profile) => {
          if (profile.age === null) {
            return false;
          }

          return (
            profile.age >=
              selectedAgeRange.min &&
            profile.age <=
              selectedAgeRange.max
          );
        },
      );
    }

    /*
     * Education
     */
    if (
      education !== "Any education"
    ) {
      result = result.filter(
        (profile) =>
          profile.education ===
          education,
      );
    }

    /*
     * Profession
     */
    if (
      profession !==
      "Any profession"
    ) {
      result = result.filter(
        (profile) =>
          profile.profession ===
          profession,
      );
    }

    /*
     * Marital status
     */
    if (
      maritalStatus !== "Any status"
    ) {
      result = result.filter(
        (profile) =>
          profile.maritalStatus ===
          maritalStatus,
      );
    }

    /*
     * Verified
     */
    if (verifiedOnly) {
      result = result.filter(
        (profile) =>
          profile.verified,
      );
    }

    /*
     * Sorting
     */
    if (sort === "Newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(
              a.createdAt,
            ).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(
              b.createdAt,
            ).getTime()
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

  const toggleShortlist = (
    id: string,
  ) => {
    setShortlisted((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id,
          )
        : [...current, id],
    );
  };

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

  return (
    <div className={styles.page}>
      <div
        className={styles.backgroundGlow}
      />

      <div
        className={
          styles.backgroundGlowTwo
        }
      />

      <div className="container">
        <header
          className={
            styles.pageHeader
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Discover
            </span>

            <h1>
              Find meaningful
              connections
            </h1>

            <p>
              Explore profiles based
              on your preferences,
              compatibility, and
              shared interests.
            </p>
          </div>

          <Link
            href="/profile"
            className={
              styles.profileButton
            }
          >
            <FiUser
              aria-hidden="true"
            />

            <span>
              My profile
            </span>
          </Link>
        </header>

        <section
          className={
            styles.searchPanel
          }
        >
          <div
            className={
              styles.searchBox
            }
          >
            <FiSearch
              className={
                styles.searchIcon
              }
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search by name, profession or location..."
              aria-label="Search profiles"
            />

            {search && (
              <button
                type="button"
                className={
                  styles.clearSearch
                }
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <FiX
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          <button
            type="button"
            className={
              styles.mobileFilterButton
            }
            onClick={() =>
              setShowFilters(true)
            }
          >
            <FiSliders
              aria-hidden="true"
            />

            <span>
              Filters
            </span>
          </button>
        </section>

        <div
          className={
            styles.contentLayout
          }
        >
          <aside
            className={`${styles.filtersSidebar} ${
              showFilters
                ? styles.filtersOpen
                : ""
            }`}
          >
            <div
              className={
                styles.filterMobileHeader
              }
            >
              <div>
                <span>
                  Refine results
                </span>

                <strong>
                  Filters
                </strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    false,
                  )
                }
                aria-label="Close filters"
              >
                <FiX
                  aria-hidden="true"
                />
              </button>
            </div>

            <div
              className={
                styles.filterHeading
              }
            >
              <div>
                <FiFilter
                  aria-hidden="true"
                />

                <h2>
                  Refine your
                  search
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >
                Reset
              </button>
            </div>

            <div
              className={
                styles.filters
              }
            >
              <FilterSelect
                label="Location"
                value={location}
                options={
                  locationOptions
                }
                onChange={
                  setLocation
                }
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
                options={
                  educationOptions
                }
                onChange={
                  setEducation
                }
              />

              <FilterSelect
                label="Profession"
                value={profession}
                options={
                  professionOptions
                }
                onChange={
                  setProfession
                }
              />

              <FilterSelect
                label="Marital status"
                value={
                  maritalStatus
                }
                options={
                  maritalStatusOptions
                }
                onChange={
                  setMaritalStatus
                }
              />

              <label
                className={
                  styles.checkOption
                }
              >
                <input
                  type="checkbox"
                  checked={
                    verifiedOnly
                  }
                  onChange={(
                    event,
                  ) =>
                    setVerifiedOnly(
                      event.target
                        .checked,
                    )
                  }
                />

                <span
                  className={
                    styles.customCheck
                  }
                >
                  <FiCheck
                    aria-hidden="true"
                  />
                </span>

                <span>
                  <strong>
                    Verified
                    profiles only
                  </strong>

                  <small>
                    Show profiles
                    with
                    verification
                  </small>
                </span>
              </label>
            </div>

            <div
              className={
                styles.filterBottom
              }
            >
              <div>
                <FiShield
                  aria-hidden="true"
                />

                <span>
                  You control
                  what
                  information
                  you share.
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    false,
                  )
                }
              >
                Show results
              </button>
            </div>
          </aside>

          {showFilters && (
            <button
              type="button"
              className={
                styles.filterOverlay
              }
              onClick={() =>
                setShowFilters(
                  false,
                )
              }
              aria-label="Close filter panel"
            />
          )}

          <main
            className={styles.results}
          >
            <div
              className={
                styles.resultsHeader
              }
            >
              <div>
                <strong>
                  {loading
                    ? "Loading..."
                    : filteredProfiles.length}
                </strong>

                {!loading && (
                  <span>
                    {" "}
                    profiles matching
                    your preferences
                  </span>
                )}
              </div>

              <div
                className={
                  styles.sortWrapper
                }
              >
                <span>
                  Sort by
                </span>

                <div>
                  <select
                    value={sort}
                    onChange={(
                      event,
                    ) =>
                      setSort(
                        event.target
                          .value,
                      )
                    }
                    aria-label="Sort profiles"
                  >
                    <option>
                      Newest
                    </option>

                    <option>
                      Best match
                    </option>
                  </select>

                  <FiChevronDown
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div
                className={
                  styles.emptyState
                }
              >
                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  <FiSearch
                    aria-hidden="true"
                  />
                </div>

                <h2>
                  Loading profiles...
                </h2>

                <p>
                  Please wait while
                  we find profiles
                  for you.
                </p>
              </div>
            ) : error ? (
              <div
                className={
                  styles.emptyState
                }
              >
                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  <FiX
                    aria-hidden="true"
                  />
                </div>

                <h2>
                  Something went
                  wrong
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try again
                </button>
              </div>
            ) : filteredProfiles.length >
              0 ? (
              <>
                <div
                  className={
                    styles.profileGrid
                  }
                >
                  {filteredProfiles.map(
                    (profile) => (
                      <ProfileCard
                        key={
                          profile.id
                        }
                        profile={
                          profile
                        }
                        shortlisted={shortlisted.includes(
                          profile.id,
                        )}
                        onShortlist={() =>
                          toggleShortlist(
                            profile.id,
                          )
                        }
                      />
                    ),
                  )}
                </div>

                <div
                  className={
                    styles.loadMore
                  }
                >
                  <button
                    type="button"
                    disabled
                  >
                    All profiles
                    loaded
                  </button>

                  <span>
                    Showing{" "}
                    {
                      filteredProfiles.length
                    }{" "}
                    of{" "}
                    {
                      profiles.length
                    }{" "}
                    profiles
                  </span>
                </div>
              </>
            ) : (
              <div
                className={
                  styles.emptyState
                }
              >
                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  <FiSearch
                    aria-hidden="true"
                  />
                </div>

                <h2>
                  No profiles found
                </h2>

                <p>
                  Try changing your
                  filters or search
                  for something
                  different.
                </p>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                >
                  Clear all
                  filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}