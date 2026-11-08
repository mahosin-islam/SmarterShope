'use client';

import { useState, useEffect } from 'react';

export interface GeoItem {
  id: string;
  name: string;
  bn_name?: string;
  division_id?: string;
  district_id?: string;
  upazilla_id?: string;
}

interface RawPhpMyAdminJson {
  type: string;
  name?: string;
  data?: GeoItem[];
}

// In-memory cache so we only load once
let cachedDivisions: GeoItem[] | null = null;
let cachedDistricts: GeoItem[] | null = null;
let cachedUpazilas: GeoItem[] | null = null;
let cachedUnions: GeoItem[] | null = null;

export function useBangladeshGeo() {
  const [divisions, setDivisions] = useState<GeoItem[]>(cachedDivisions || []);
  const [districts, setDistricts] = useState<GeoItem[]>(cachedDistricts || []);
  const [upazilas, setUpazilas] = useState<GeoItem[]>(cachedUpazilas || []);
  const [unions, setUnions] = useState<GeoItem[]>(cachedUnions || []);
  const [isLoading, setIsLoading] = useState(!cachedDivisions);

  useEffect(() => {
    let isMounted = true;

    async function loadGeoData() {
      try {
        // 1. Load divisions & districts first (lightweight)
        if (!cachedDivisions) {
          const res = await fetch('/data/divisions.json');
          if (res.ok) {
            const json: RawPhpMyAdminJson[] = await res.json();
            const table = json.find((t) => t.type === 'table' && t.name === 'divisions');
            cachedDivisions = table?.data || [];
          }
        }

        if (!cachedDistricts) {
          const res = await fetch('/data/districts.json');
          if (res.ok) {
            const json: RawPhpMyAdminJson[] = await res.json();
            const table = json.find((t) => t.type === 'table' && t.name === 'districts');
            cachedDistricts = table?.data || [];
          }
        }

        if (!cachedUpazilas) {
          const res = await fetch('/data/upazilas.json');
          if (res.ok) {
            const json: RawPhpMyAdminJson[] = await res.json();
            const table = json.find((t) => t.type === 'table' && t.name === 'upazilas');
            cachedUpazilas = table?.data || [];
          }
        }

        if (!cachedUnions) {
          const res = await fetch('/data/unions.json');
          if (res.ok) {
            const json: RawPhpMyAdminJson[] = await res.json();
            const table = json.find((t) => t.type === 'table' && t.name === 'unions');
            cachedUnions = table?.data || [];
          }
        }

        if (isMounted) {
          setDivisions(cachedDivisions || []);
          setDistricts(cachedDistricts || []);
          setUpazilas(cachedUpazilas || []);
          setUnions(cachedUnions || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load Bangladesh geographic data:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadGeoData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getDistrictsByDivisionId = (divisionId: string) => {
    if (!divisionId) return [];
    return districts.filter((d) => String(d.division_id) === String(divisionId));
  };

  const getUpazilasByDistrictId = (districtId: string) => {
    if (!districtId) return [];
    return upazilas.filter((u) => String(u.district_id) === String(districtId));
  };

  const getUnionsByUpazilaId = (upazilaId: string) => {
    if (!upazilaId) return [];
    return unions.filter((u) => String(u.upazilla_id) === String(upazilaId));
  };

  const formatGeoLabel = (item: GeoItem) => {
    return item.bn_name ? `${item.name} (${item.bn_name})` : item.name;
  };

  return {
    divisions,
    districts,
    upazilas,
    unions,
    isLoading,
    getDistrictsByDivisionId,
    getUpazilasByDistrictId,
    getUnionsByUpazilaId,
    formatGeoLabel,
  };
}
