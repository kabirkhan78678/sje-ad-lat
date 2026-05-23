import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type DefaultValues } from "react-hook-form";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { FormField } from "@/components/shared/FormField";
import { JSONPreviewDrawer } from "@/components/shared/JSONPreviewDrawer";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/shared/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useNationwidePresence } from "@/modules/home-content/hooks/useNationwidePresence";
import {
  nationwidePresenceLocationSchema,
  nationwidePresenceSectionSchema,
  nationwidePresenceStateSchema,
  nationwidePresenceStateServiceSchema,
  nationwidePresenceStatSchema,
} from "@/modules/home-content/nationwidePresenceSchemas";
import type {
  NationwidePresenceLocation,
  NationwidePresenceLocationPayload,
  NationwidePresenceSectionPayload,
  NationwidePresenceState,
  NationwidePresenceStatePayload,
  NationwidePresenceStateService,
  NationwidePresenceStateServicePayload,
  NationwidePresenceStat,
  NationwidePresenceStatPayload,
} from "@/modules/home-content/types/nationwidePresence";
import {
  createNationwidePresenceLocation,
  createNationwidePresenceState,
  createNationwidePresenceStateService,
  createNationwidePresenceStat,
  deleteNationwidePresenceLocation,
  deleteNationwidePresenceState,
  deleteNationwidePresenceStateService,
  deleteNationwidePresenceStat,
  getNationwidePresenceLocations,
  getNationwidePresenceStateServices,
  getNationwidePresenceStates,
  getNationwidePresenceStats,
  updateNationwidePresenceLocation,
  updateNationwidePresenceSection,
  updateNationwidePresenceState,
  updateNationwidePresenceStateService,
  updateNationwidePresenceStat,
} from "@/services/api/nationwidePresence";
import type { TableColumn } from "@/types/resources";
import { getErrorMessage } from "@/utils/error";

const INDIA_STATE_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

const defaultSectionValues: NationwidePresenceSectionPayload = {
  section_label: "",
  section_title: "",
  section_subtitle: "",
  is_active: true,
};

const defaultStateValues: NationwidePresenceStatePayload = {
  state_name: "",
  project_count: "",
  display_order: 1,
  is_active: true,
};

const defaultServiceValues: NationwidePresenceStateServicePayload = {
  service_title: "",
  display_order: 1,
  is_active: true,
};

const defaultLocationValues: NationwidePresenceLocationPayload = {
  city_name: "",
  short_code: "",
  subtitle: "",
  state_id: 0,
  display_order: 1,
  is_active: true,
};

const defaultStatValues: NationwidePresenceStatPayload = {
  stat_key: "",
  stat_value: "",
  stat_label: "",
  display_order: 1,
  is_active: true,
};

const normalizeService = (
  item: Record<string, unknown>,
): NationwidePresenceStateService => ({
  id: Number(item.id ?? 0),
  state_id: item.state_id ? Number(item.state_id) : undefined,
  service_title: String(item.service_title ?? ""),
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
  created_at: typeof item.created_at === "string" ? item.created_at : undefined,
  updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
});

const normalizeState = (
  item: Record<string, unknown>,
): NationwidePresenceState => ({
  id: Number(item.id ?? 0),
  state_name: String(item.state_name ?? ""),
  project_count: String(item.project_count ?? ""),
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
  services: Array.isArray(item.services)
    ? item.services.map((service) =>
        normalizeService(service as Record<string, unknown>),
      )
    : [],
  created_at: typeof item.created_at === "string" ? item.created_at : undefined,
  updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
});

const normalizeLocation = (
  item: Record<string, unknown>,
): NationwidePresenceLocation => ({
  id: Number(item.id ?? 0),
  city_name: String(item.city_name ?? ""),
  short_code: String(item.short_code ?? ""),
  subtitle: String(item.subtitle ?? ""),
  state_id: Number(item.state_id ?? 0),
  state_name: item.state_name ? String(item.state_name) : undefined,
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
  created_at: typeof item.created_at === "string" ? item.created_at : undefined,
  updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
});

const normalizeStat = (
  item: Record<string, unknown>,
): NationwidePresenceStat => ({
  id: Number(item.id ?? 0),
  stat_key: String(item.stat_key ?? ""),
  stat_value: String(item.stat_value ?? ""),
  stat_label: String(item.stat_label ?? ""),
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
  created_at: typeof item.created_at === "string" ? item.created_at : undefined,
  updated_at: typeof item.updated_at === "string" ? item.updated_at : undefined,
});

const sortServices = (items: NationwidePresenceStateService[]) =>
  [...items].sort(
    (left, right) =>
      left.display_order - right.display_order || left.id - right.id,
  );

const sortStates = (items: NationwidePresenceState[]) =>
  [...items].sort(
    (left, right) =>
      left.display_order - right.display_order || left.id - right.id,
  );

const sortLocations = (items: NationwidePresenceLocation[]) =>
  [...items].sort(
    (left, right) =>
      left.display_order - right.display_order || left.id - right.id,
  );

const sortStats = (items: NationwidePresenceStat[]) =>
  [...items].sort(
    (left, right) =>
      left.display_order - right.display_order || left.id - right.id,
  );

const stateColumns: TableColumn<NationwidePresenceState>[] = [
  {
    key: "state_name",
    label: "State",
    render: (state) => (
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{state.state_name}</p>
        <p className="text-sm text-slate-500">{state.project_count} projects</p>
      </div>
    ),
  },
  {
    key: "services",
    label: "Services",
    render: (state) => (
      <div className="flex max-w-md flex-wrap gap-2">
        {state.services.length ? (
          state.services.map((service) => (
            <Badge
              key={service.id}
              tone={service.is_active ? "info" : "neutral"}
            >
              {service.service_title}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">No services added</span>
        )}
      </div>
    ),
  },
  { key: "display_order", label: "Order" },
  {
    key: "is_active",
    label: "Status",
    render: (state) => (
      <Badge tone={state.is_active ? "success" : "neutral"}>
        {state.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

const serviceColumns: TableColumn<NationwidePresenceStateService>[] = [
  { key: "service_title", label: "Service Title" },
  { key: "display_order", label: "Order" },
  {
    key: "is_active",
    label: "Status",
    render: (service) => (
      <Badge tone={service.is_active ? "success" : "neutral"}>
        {service.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

const locationColumns: TableColumn<NationwidePresenceLocation>[] = [
  {
    key: "city_name",
    label: "Location",
    render: (location) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900">{location.city_name}</p>
          <Badge tone="info">{location.short_code}</Badge>
        </div>
        <p className="text-sm text-slate-500">{location.subtitle}</p>
      </div>
    ),
  },
  {
    key: "state_name",
    label: "State",
    render: (location) => location.state_name ?? "—",
  },
  { key: "display_order", label: "Order" },
  {
    key: "is_active",
    label: "Status",
    render: (location) => (
      <Badge tone={location.is_active ? "success" : "neutral"}>
        {location.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

const statColumns: TableColumn<NationwidePresenceStat>[] = [
  {
    key: "stat_label",
    label: "Stat",
    render: (stat) => (
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{stat.stat_label}</p>
        <p className="text-sm text-slate-500">
          {stat.stat_key} • {stat.stat_value}
        </p>
      </div>
    ),
  },
  { key: "display_order", label: "Order" },
  {
    key: "is_active",
    label: "Status",
    render: (stat) => (
      <Badge tone={stat.is_active ? "success" : "neutral"}>
        {stat.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

export const NationwidePresencePage = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const stateModalDisclosure = useDisclosure(false);
  const locationModalDisclosure = useDisclosure(false);
  const statModalDisclosure = useDisclosure(false);
  const servicesModalDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const { data, rawData, error, isLoading, refetch } = useNationwidePresence();

  const [states, setStates] = useState<NationwidePresenceState[]>([]);
  const [locations, setLocations] = useState<NationwidePresenceLocation[]>([]);
  const [stats, setStats] = useState<NationwidePresenceStat[]>([]);
  const [editingState, setEditingState] =
    useState<NationwidePresenceState | null>(null);
  const [editingLocation, setEditingLocation] =
    useState<NationwidePresenceLocation | null>(null);
  const [editingStat, setEditingStat] = useState<NationwidePresenceStat | null>(
    null,
  );
  const [managingState, setManagingState] =
    useState<NationwidePresenceState | null>(null);
  const [editingService, setEditingService] =
    useState<NationwidePresenceStateService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    entity: "state" | "service" | "location" | "stat";
    id: number;
    label: string;
  } | null>(null);

  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isSavingState, setIsSavingState] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isSavingStat, setIsSavingStat] = useState(false);

  const [stateSearchValue, setStateSearchValue] = useState("");
  const [stateStatusFilter, setStateStatusFilter] = useState("");
  const [stateCurrentPage, setStateCurrentPage] = useState(1);
  const [statePageSize, setStatePageSize] = useState(10);

  const [serviceSearchValue, setServiceSearchValue] = useState("");
  const [serviceCurrentPage, setServiceCurrentPage] = useState(1);
  const [servicePageSize, setServicePageSize] = useState(10);

  const [locationSearchValue, setLocationSearchValue] = useState("");
  const [locationStatusFilter, setLocationStatusFilter] = useState("");
  const [locationCurrentPage, setLocationCurrentPage] = useState(1);
  const [locationPageSize, setLocationPageSize] = useState(10);

  const [statSearchValue, setStatSearchValue] = useState("");
  const [statStatusFilter, setStatStatusFilter] = useState("");
  const [statCurrentPage, setStatCurrentPage] = useState(1);
  const [statPageSize, setStatPageSize] = useState(10);

  const debouncedStateSearch = useDebouncedValue(stateSearchValue, 250);
  const debouncedServiceSearch = useDebouncedValue(serviceSearchValue, 250);
  const debouncedLocationSearch = useDebouncedValue(locationSearchValue, 250);
  const debouncedStatSearch = useDebouncedValue(statSearchValue, 250);

  const sectionForm = useForm<NationwidePresenceSectionPayload>({
    resolver: zodResolver(nationwidePresenceSectionSchema),
    defaultValues:
      defaultSectionValues as DefaultValues<NationwidePresenceSectionPayload>,
    mode: "onChange",
  });

  const stateForm = useForm<NationwidePresenceStatePayload>({
    resolver: zodResolver(nationwidePresenceStateSchema),
    defaultValues:
      defaultStateValues as DefaultValues<NationwidePresenceStatePayload>,
    mode: "onChange",
  });

  const serviceForm = useForm<NationwidePresenceStateServicePayload>({
    resolver: zodResolver(nationwidePresenceStateServiceSchema),
    defaultValues:
      defaultServiceValues as DefaultValues<NationwidePresenceStateServicePayload>,
    mode: "onChange",
  });

  const locationForm = useForm<NationwidePresenceLocationPayload>({
    resolver: zodResolver(nationwidePresenceLocationSchema),
    defaultValues:
      defaultLocationValues as DefaultValues<NationwidePresenceLocationPayload>,
    mode: "onChange",
  });

  const statForm = useForm<NationwidePresenceStatPayload>({
    resolver: zodResolver(nationwidePresenceStatSchema),
    defaultValues:
      defaultStatValues as DefaultValues<NationwidePresenceStatPayload>,
    mode: "onChange",
  });

  const loadStates = async () => {
    const response = await getNationwidePresenceStates();
    setStates(
      sortStates(
        response.items.map((item) =>
          normalizeState(item as Record<string, unknown>),
        ),
      ),
    );
  };

  const loadLocations = async () => {
    const response = await getNationwidePresenceLocations();
    setLocations(
      sortLocations(
        response.items.map((item) =>
          normalizeLocation(item as Record<string, unknown>),
        ),
      ),
    );
  };

  const loadStats = async () => {
    const response = await getNationwidePresenceStats();
    setStats(
      sortStats(
        response.items.map((item) =>
          normalizeStat(item as Record<string, unknown>),
        ),
      ),
    );
  };

  const loadAll = async () => {
    await Promise.all([refetch(), loadStates(), loadLocations(), loadStats()]);
  };

  useEffect(() => {
    const section = data?.section;

    sectionForm.reset({
      section_label: section?.section_label ?? "",
      section_title: section?.section_title ?? "",
      section_subtitle: section?.section_subtitle ?? "",
      is_active: section?.is_active ?? true,
    });

    setStates(
      sortStates(
        (data?.states ?? []).map((item) =>
          normalizeState(item as Record<string, unknown>),
        ),
      ),
    );
    setLocations(
      sortLocations(
        (data?.locations ?? []).map((item) =>
          normalizeLocation(item as Record<string, unknown>),
        ),
      ),
    );
    setStats(
      sortStats(
        (data?.stats ?? []).map((item) =>
          normalizeStat(item as Record<string, unknown>),
        ),
      ),
    );
  }, [data, sectionForm]);

  const stateOptions = useMemo(
    () =>
      sortStates(states).map((state) => ({
        label: state.state_name,
        value: String(state.id),
      })),
    [states],
  );

  const filteredStates = useMemo(() => {
    return states.filter((state) => {
      const query = debouncedStateSearch.toLowerCase();
      const matchesSearch =
        !debouncedStateSearch ||
        state.state_name.toLowerCase().includes(query) ||
        state.project_count.toLowerCase().includes(query) ||
        state.services.some((service) =>
          service.service_title.toLowerCase().includes(query),
        );

      const matchesStatus =
        !stateStatusFilter ||
        (stateStatusFilter === "active" && state.is_active) ||
        (stateStatusFilter === "inactive" && !state.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedStateSearch, stateStatusFilter, states]);

  const filteredServices = useMemo(() => {
    const services = sortServices(managingState?.services ?? []);
    if (!debouncedServiceSearch) {
      return services;
    }

    return services.filter((service) =>
      service.service_title
        .toLowerCase()
        .includes(debouncedServiceSearch.toLowerCase()),
    );
  }, [debouncedServiceSearch, managingState]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const query = debouncedLocationSearch.toLowerCase();
      const matchesSearch =
        !debouncedLocationSearch ||
        location.city_name.toLowerCase().includes(query) ||
        location.short_code.toLowerCase().includes(query) ||
        location.subtitle.toLowerCase().includes(query) ||
        (location.state_name ?? "").toLowerCase().includes(query);

      const matchesStatus =
        !locationStatusFilter ||
        (locationStatusFilter === "active" && location.is_active) ||
        (locationStatusFilter === "inactive" && !location.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedLocationSearch, locationStatusFilter, locations]);

  const filteredStats = useMemo(() => {
    return stats.filter((stat) => {
      const query = debouncedStatSearch.toLowerCase();
      const matchesSearch =
        !debouncedStatSearch ||
        stat.stat_key.toLowerCase().includes(query) ||
        stat.stat_label.toLowerCase().includes(query) ||
        stat.stat_value.toLowerCase().includes(query);

      const matchesStatus =
        !statStatusFilter ||
        (statStatusFilter === "active" && stat.is_active) ||
        (statStatusFilter === "inactive" && !stat.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedStatSearch, statStatusFilter, stats]);

  const paginatedStates = useMemo(
    () =>
      filteredStates.slice(
        (stateCurrentPage - 1) * statePageSize,
        stateCurrentPage * statePageSize,
      ),
    [filteredStates, stateCurrentPage, statePageSize],
  );

  const paginatedServices = useMemo(
    () =>
      filteredServices.slice(
        (serviceCurrentPage - 1) * servicePageSize,
        serviceCurrentPage * servicePageSize,
      ),
    [filteredServices, serviceCurrentPage, servicePageSize],
  );

  const paginatedLocations = useMemo(
    () =>
      filteredLocations.slice(
        (locationCurrentPage - 1) * locationPageSize,
        locationCurrentPage * locationPageSize,
      ),
    [filteredLocations, locationCurrentPage, locationPageSize],
  );

  const paginatedStats = useMemo(
    () =>
      filteredStats.slice(
        (statCurrentPage - 1) * statPageSize,
        statCurrentPage * statPageSize,
      ),
    [filteredStats, statCurrentPage, statPageSize],
  );

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredStates.length / statePageSize),
    );
    if (stateCurrentPage > totalPages) {
      setStateCurrentPage(totalPages);
    }
  }, [filteredStates.length, stateCurrentPage, statePageSize]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredServices.length / servicePageSize),
    );
    if (serviceCurrentPage > totalPages) {
      setServiceCurrentPage(totalPages);
    }
  }, [filteredServices.length, serviceCurrentPage, servicePageSize]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredLocations.length / locationPageSize),
    );
    if (locationCurrentPage > totalPages) {
      setLocationCurrentPage(totalPages);
    }
  }, [filteredLocations.length, locationCurrentPage, locationPageSize]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredStats.length / statPageSize),
    );
    if (statCurrentPage > totalPages) {
      setStatCurrentPage(totalPages);
    }
  }, [filteredStats.length, statCurrentPage, statPageSize]);

  const openCreateStateModal = () => {
    setEditingState(null);
    stateForm.reset({
      ...defaultStateValues,
      display_order: states.length + 1,
    });
    stateModalDisclosure.open();
  };

  const openEditStateModal = (state: NationwidePresenceState) => {
    setEditingState(state);
    stateForm.reset({
      state_name: state.state_name,
      project_count: state.project_count,
      display_order: state.display_order,
      is_active: state.is_active,
    });
    stateModalDisclosure.open();
  };

  const closeStateModal = () => {
    setEditingState(null);
    stateForm.reset(defaultStateValues);
    stateModalDisclosure.close();
  };

  const openServicesModal = (state: NationwidePresenceState) => {
    setManagingState(state);
    setEditingService(null);
    serviceForm.reset({
      ...defaultServiceValues,
      display_order: (state.services?.length ?? 0) + 1,
      is_active: true,
    });
    setServiceSearchValue("");
    setServiceCurrentPage(1);
    servicesModalDisclosure.open();
  };

  const closeServicesModal = () => {
    setManagingState(null);
    setEditingService(null);
    serviceForm.reset(defaultServiceValues);
    servicesModalDisclosure.close();
  };

  const beginEditService = (service: NationwidePresenceStateService) => {
    setEditingService(service);
    serviceForm.reset({
      service_title: service.service_title,
      display_order: service.display_order,
      is_active: service.is_active,
    });
  };

  const resetServiceEditor = (nextDisplayOrder?: number) => {
    setEditingService(null);
    serviceForm.reset({
      ...defaultServiceValues,
      display_order:
        nextDisplayOrder ?? (managingState?.services?.length ?? 0) + 1,
      is_active: true,
    });
  };

  const openCreateLocationModal = () => {
    setEditingLocation(null);
    locationForm.reset({
      ...defaultLocationValues,
      state_id: states[0]?.id ?? 0,
      display_order: locations.length + 1,
    });
    locationModalDisclosure.open();
  };

  const openEditLocationModal = (location: NationwidePresenceLocation) => {
    setEditingLocation(location);
    locationForm.reset({
      city_name: location.city_name,
      short_code: location.short_code,
      subtitle: location.subtitle,
      state_id: location.state_id,
      display_order: location.display_order,
      is_active: location.is_active,
    });
    locationModalDisclosure.open();
  };

  const closeLocationModal = () => {
    setEditingLocation(null);
    locationForm.reset(defaultLocationValues);
    locationModalDisclosure.close();
  };

  const openCreateStatModal = () => {
    setEditingStat(null);
    statForm.reset({
      ...defaultStatValues,
      display_order: stats.length + 1,
    });
    statModalDisclosure.open();
  };

  const openEditStatModal = (stat: NationwidePresenceStat) => {
    setEditingStat(stat);
    statForm.reset({
      stat_key: stat.stat_key,
      stat_value: stat.stat_value,
      stat_label: stat.stat_label,
      display_order: stat.display_order,
      is_active: stat.is_active,
    });
    statModalDisclosure.open();
  };

  const closeStatModal = () => {
    setEditingStat(null);
    statForm.reset(defaultStatValues);
    statModalDisclosure.close();
  };

  const refreshServicesForState = async (stateId: number) => {
    const [servicesResponse, statesResponse] = await Promise.all([
      getNationwidePresenceStateServices(stateId),
      getNationwidePresenceStates(),
    ]);

    const nextStates = sortStates(
      statesResponse.items.map((item) =>
        normalizeState(item as Record<string, unknown>),
      ),
    );

    const nextServices = sortServices(
      servicesResponse.items.map((item) =>
        normalizeService(item as Record<string, unknown>),
      ),
    );

    setStates(
      nextStates.map((state) =>
        state.id === stateId
          ? {
              ...state,
              services: nextServices,
            }
          : state,
      ),
    );

    const selectedState = nextStates.find((state) => state.id === stateId);
    setManagingState(
      selectedState
        ? {
            ...selectedState,
            services: nextServices,
          }
        : null,
    );

    return nextServices;
  };

  const submitSection = sectionForm.handleSubmit(async (values) => {
    setIsSavingSection(true);

    try {
      await updateNationwidePresenceSection({
        ...values,
        is_active: Number(values.is_active),
      });
      await refetch();
      showToast({
        title: "Nationwide Presence updated",
        description: "Section content was saved successfully.",
        tone: "success",
      });
    } catch (submitError) {
      showToast({
        title: "Unable to save section content",
        description: getErrorMessage(submitError),
        tone: "error",
      });
    } finally {
      setIsSavingSection(false);
    }
  });

  const submitState = stateForm.handleSubmit(async (values) => {
    setIsSavingState(true);

    try {
      const payload = {
        ...values,
        state_name: values.state_name.trim(),
        project_count: values.project_count.trim(),
        is_active: Number(values.is_active),
      };

      if (editingState) {
        await updateNationwidePresenceState(editingState.id, payload);
      } else {
        await createNationwidePresenceState(payload);
      }

      await loadAll();
      closeStateModal();
      showToast({
        title: editingState ? "State updated" : "State created",
        description: editingState
          ? "Nationwide Presence state changes were saved."
          : "A new state was added successfully.",
        tone: "success",
      });
    } catch (submitError) {
      showToast({
        title: "Unable to save state",
        description: getErrorMessage(submitError),
        tone: "error",
      });
    } finally {
      setIsSavingState(false);
    }
  });

  const submitService = serviceForm.handleSubmit(async (values) => {
    if (!managingState) {
      return;
    }

    setIsSavingService(true);

    try {
      const payload = {
        service_title: values.service_title.trim(),
        display_order: values.display_order,
        is_active: Number(values.is_active),
      };

      if (editingService) {
        await updateNationwidePresenceStateService(editingService.id, payload);
      } else {
        await createNationwidePresenceStateService(managingState.id, payload);
      }

      const nextServices = await refreshServicesForState(managingState.id);
      resetServiceEditor(nextServices.length + 1);
      showToast({
        title: editingService ? "Service updated" : "Service created",
        description: editingService
          ? "State service changes were saved."
          : "A new service was added to the selected state.",
        tone: "success",
      });
    } catch (submitError) {
      showToast({
        title: "Unable to save service",
        description: getErrorMessage(submitError),
        tone: "error",
      });
    } finally {
      setIsSavingService(false);
    }
  });

  const submitLocation = locationForm.handleSubmit(async (values) => {
    setIsSavingLocation(true);

    try {
      const payload = {
        ...values,
        city_name: values.city_name.trim(),
        short_code: values.short_code.trim().toUpperCase(),
        subtitle: values.subtitle.trim(),
        is_active: Number(values.is_active),
      };

      if (editingLocation) {
        await updateNationwidePresenceLocation(editingLocation.id, payload);
      } else {
        await createNationwidePresenceLocation(payload);
      }

      await loadAll();
      closeLocationModal();
      showToast({
        title: editingLocation ? "Location updated" : "Location created",
        description: editingLocation
          ? "Installation location changes were saved."
          : "A new installation location was added.",
        tone: "success",
      });
    } catch (submitError) {
      showToast({
        title: "Unable to save location",
        description: getErrorMessage(submitError),
        tone: "error",
      });
    } finally {
      setIsSavingLocation(false);
    }
  });

  const submitStat = statForm.handleSubmit(async (values) => {
    setIsSavingStat(true);

    try {
      const payload = {
        ...values,
        stat_key: values.stat_key.trim(),
        stat_value: values.stat_value.trim(),
        stat_label: values.stat_label.trim(),
        is_active: Number(values.is_active),
      };

      if (editingStat) {
        await updateNationwidePresenceStat(editingStat.id, payload);
      } else {
        await createNationwidePresenceStat(payload);
      }

      await loadAll();
      closeStatModal();
      showToast({
        title: editingStat ? "Stat updated" : "Stat created",
        description: editingStat
          ? "Bottom stat card changes were saved."
          : "A new bottom stat card was added.",
        tone: "success",
      });
    } catch (submitError) {
      showToast({
        title: "Unable to save stat",
        description: getErrorMessage(submitError),
        tone: "error",
      });
    } finally {
      setIsSavingStat(false);
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const currentTarget = deleteTarget;

    try {
      if (currentTarget.entity === "state") {
        setIsSavingState(true);
        await deleteNationwidePresenceState(currentTarget.id);
        await loadAll();
      } else if (currentTarget.entity === "service") {
        setIsSavingService(true);
        await deleteNationwidePresenceStateService(currentTarget.id);
        if (managingState) {
          await refreshServicesForState(managingState.id);
        }
      } else if (currentTarget.entity === "location") {
        setIsSavingLocation(true);
        await deleteNationwidePresenceLocation(currentTarget.id);
        await loadAll();
      } else {
        setIsSavingStat(true);
        await deleteNationwidePresenceStat(currentTarget.id);
        await loadAll();
      }

      deleteDisclosure.close();
      setDeleteTarget(null);
      showToast({
        title: "Item deleted",
        description: `"${currentTarget.label}" has been removed successfully.`,
        tone: "success",
      });
    } catch (deleteError) {
      showToast({
        title: "Unable to delete item",
        description: getErrorMessage(deleteError),
        tone: "error",
      });
    } finally {
      setIsSavingState(false);
      setIsSavingService(false);
      setIsSavingLocation(false);
      setIsSavingStat(false);
    }
  };

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void loadAll()} />;
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => void loadAll()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={previewDisclosure.open} variant="outline">
              <Eye className="h-4 w-4" />
              Preview API Data
            </Button>
            <Button onClick={openCreateStateModal} variant="outline">
              <Plus className="h-4 w-4" />
              Add State
            </Button>
            <Button
              disabled={!states.length}
              onClick={openCreateLocationModal}
              variant="outline"
            >
              <MapPin className="h-4 w-4" />
              Add Location
            </Button>
            <Button onClick={openCreateStatModal}>
              <Plus className="h-4 w-4" />
              Add Stat
            </Button>
          </>
        }
        description="Manage section copy, map states, state services, installation locations, and bottom stat cards for the homepage Nationwide Presence section."
        title="Nationwide Presence"
      />

      <Card className="relative p-5 sm:p-6">
        <LoadingOverlay
          label={
            isLoading
              ? "Loading Nationwide Presence..."
              : "Saving section content..."
          }
          show={isLoading || isSavingSection}
        />

        <div className="mb-5">
          <h2 className="font-display text-xl font-semibold text-slate-950">
            Section Content
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Control the section headline, supporting copy, and homepage
            visibility.
          </p>
        </div>

        <form className="space-y-5" onSubmit={submitSection}>
          <div className="field-grid">
            <FormField
              error={sectionForm.formState.errors.section_label?.message}
              label="Section Label"
              required
            >
              <Input
                {...sectionForm.register("section_label")}
                placeholder="PAN-INDIA PRESENCE"
              />
            </FormField>

            <FormField
              error={sectionForm.formState.errors.section_title?.message}
              label="Section Title"
              required
            >
              <Input
                {...sectionForm.register("section_title")}
                placeholder="Nationwide Presence Across India"
              />
            </FormField>

            <FormField
              className="md:col-span-2"
              error={sectionForm.formState.errors.section_subtitle?.message}
              label="Section Subtitle"
              required
            >
              <Textarea
                {...sectionForm.register("section_subtitle")}
                placeholder="Sri Jaya Enterprises serves laboratories, industries, and water plants across multiple Indian states."
                rows={4}
              />
            </FormField>

            <FormField
              description="Inactive section stays hidden on the homepage."
              label="Is Active"
            >
              <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
                <Switch
                  checked={Boolean(sectionForm.watch("is_active"))}
                  onChange={(checked) =>
                    sectionForm.setValue("is_active", checked, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={isLoading}
              isLoading={isSavingSection}
              type="submit"
            >
              <Save className="h-4 w-4" />
              Save Section Content
            </Button>
          </div>
        </form>
      </Card>

      <DataTable
        actions={
          <Button onClick={openCreateStateModal} size="sm">
            <Plus className="h-4 w-4" />
            Add State
          </Button>
        }
        columns={stateColumns}
        currentPage={stateCurrentPage}
        data={paginatedStates}
        emptyState={{
          title: "No states added",
          description:
            "Add active states with project counts to power the India map section.",
        }}
        filters={[
          {
            key: "status",
            label: "All statuses",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
            value: stateStatusFilter,
            onChange: (value) => {
              setStateStatusFilter(value);
              setStateCurrentPage(1);
            },
          },
        ]}
        isLoading={isLoading}
        onPageChange={setStateCurrentPage}
        onPageSizeChange={setStatePageSize}
        onSearchChange={(value) => {
          setStateSearchValue(value);
          setStateCurrentPage(1);
        }}
        pageSize={statePageSize}
        rowActions={(state) => (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => openServicesModal(state)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => openEditStateModal(state)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setDeleteTarget({
                  entity: "state",
                  id: state.id,
                  label: state.state_name,
                });
                deleteDisclosure.open();
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        searchPlaceholder="Search states or services..."
        searchValue={stateSearchValue}
        totalItems={filteredStates.length}
      />

      <DataTable
        actions={
          <Button
            disabled={!states.length}
            onClick={openCreateLocationModal}
            size="sm"
          >
            <MapPin className="h-4 w-4" />
            Add Location
          </Button>
        }
        columns={locationColumns}
        currentPage={locationCurrentPage}
        data={paginatedLocations}
        emptyState={{
          title: "No locations added",
          description:
            "Add installation cities and short codes for the location markers section.",
        }}
        filters={[
          {
            key: "status",
            label: "All statuses",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
            value: locationStatusFilter,
            onChange: (value) => {
              setLocationStatusFilter(value);
              setLocationCurrentPage(1);
            },
          },
        ]}
        isLoading={isLoading}
        onPageChange={setLocationCurrentPage}
        onPageSizeChange={setLocationPageSize}
        onSearchChange={(value) => {
          setLocationSearchValue(value);
          setLocationCurrentPage(1);
        }}
        pageSize={locationPageSize}
        rowActions={(location) => (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => openEditLocationModal(location)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setDeleteTarget({
                  entity: "location",
                  id: location.id,
                  label: location.city_name,
                });
                deleteDisclosure.open();
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        searchPlaceholder="Search cities, states, or short codes..."
        searchValue={locationSearchValue}
        totalItems={filteredLocations.length}
      />

      <DataTable
        actions={
          <Button onClick={openCreateStatModal} size="sm">
            <Plus className="h-4 w-4" />
            Add Stat
          </Button>
        }
        columns={statColumns}
        currentPage={statCurrentPage}
        data={paginatedStats}
        emptyState={{
          title: "No stats added",
          description:
            "Add bottom stat cards to summarize nationwide reach and installations.",
        }}
        filters={[
          {
            key: "status",
            label: "All statuses",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
            value: statStatusFilter,
            onChange: (value) => {
              setStatStatusFilter(value);
              setStatCurrentPage(1);
            },
          },
        ]}
        isLoading={isLoading}
        onPageChange={setStatCurrentPage}
        onPageSizeChange={setStatPageSize}
        onSearchChange={(value) => {
          setStatSearchValue(value);
          setStatCurrentPage(1);
        }}
        pageSize={statPageSize}
        rowActions={(stat) => (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => openEditStatModal(stat)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setDeleteTarget({
                  entity: "stat",
                  id: stat.id,
                  label: stat.stat_label,
                });
                deleteDisclosure.open();
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        searchPlaceholder="Search stats..."
        searchValue={statSearchValue}
        totalItems={filteredStats.length}
      />

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={closeStateModal} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              isLoading={isSavingState}
              onClick={() => void submitState()}
              type="button"
            >
              <Save className="h-4 w-4" />
              {editingState ? "Save Changes" : "Create State"}
            </Button>
          </div>
        }
        onClose={closeStateModal}
        open={stateModalDisclosure.isOpen}
        title={editingState ? "Edit State" : "Add State"}
      >
        <div className="field-grid">
          <FormField
            error={stateForm.formState.errors.state_name?.message}
            label="State Name"
            required
          >
            <Select {...stateForm.register("state_name")}>
              <option value="">Select a state</option>
              {INDIA_STATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            error={stateForm.formState.errors.project_count?.message}
            label="Project Count"
            required
          >
            <Input {...stateForm.register("project_count")} placeholder="50+" />
          </FormField>

          <FormField
            error={stateForm.formState.errors.display_order?.message}
            label="Display Order"
            required
          >
            <Input
              {...stateForm.register("display_order", { valueAsNumber: true })}
              min={1}
              type="number"
            />
          </FormField>

          <FormField
            description="Inactive states stay hidden from the public map."
            label="Is Active"
          >
            <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
              <Switch
                checked={Boolean(stateForm.watch("is_active"))}
                onChange={(checked) =>
                  stateForm.setValue("is_active", checked, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </FormField>
        </div>
      </Modal>

      <Modal
        description={
          managingState
            ? `Manage services shown under ${managingState.state_name} on the homepage map.`
            : undefined
        }
        footer={
          <div className="flex justify-end">
            <Button onClick={closeServicesModal} type="button" variant="ghost">
              Close
            </Button>
          </div>
        }
        onClose={closeServicesModal}
        open={servicesModalDisclosure.isOpen}
        size="xl"
        title={
          managingState
            ? `${managingState.state_name} Services`
            : "State Services"
        }
      >
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">
                  {editingService ? "Edit Service" : "Add Service"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Services are grouped per state and support display order plus
                  active status.
                </p>
              </div>
              {editingService ? (
                <Button
                  onClick={() => resetServiceEditor()}
                  type="button"
                  variant="outline"
                >
                  Reset
                </Button>
              ) : null}
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submitService();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  error={serviceForm.formState.errors.service_title?.message}
                  label="Service Title"
                  required
                >
                  <Input
                    {...serviceForm.register("service_title")}
                    placeholder="Packaged Drinking Water Plants"
                  />
                </FormField>

                <FormField
                  error={serviceForm.formState.errors.display_order?.message}
                  label="Display Order"
                  required
                >
                  <Input
                    {...serviceForm.register("display_order", {
                      valueAsNumber: true,
                    })}
                    min={1}
                    type="number"
                  />
                </FormField>

                <FormField
                  description="Inactive services remain stored but hidden on the public site."
                  label="Is Active"
                >
                  <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
                    <Switch
                      checked={Boolean(serviceForm.watch("is_active"))}
                      onChange={(checked) =>
                        serviceForm.setValue("is_active", checked, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </FormField>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => resetServiceEditor()}
                  type="button"
                  variant="ghost"
                >
                  Clear
                </Button>
                <Button isLoading={isSavingService} type="submit">
                  <Save className="h-4 w-4" />
                  {editingService ? "Save Service" : "Add Service"}
                </Button>
              </div>
            </form>
          </Card>

          <DataTable
            actions={null}
            columns={serviceColumns}
            currentPage={serviceCurrentPage}
            data={paginatedServices}
            emptyState={{
              title: "No services added",
              description:
                "Add services for this state to replace hardcoded service labels on the homepage.",
            }}
            isLoading={false}
            onPageChange={setServiceCurrentPage}
            onPageSizeChange={setServicePageSize}
            onSearchChange={(value) => {
              setServiceSearchValue(value);
              setServiceCurrentPage(1);
            }}
            pageSize={servicePageSize}
            rowActions={(service) => (
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => beginEditService(service)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setDeleteTarget({
                      entity: "service",
                      id: service.id,
                      label: service.service_title,
                    });
                    deleteDisclosure.open();
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            searchPlaceholder="Search state services..."
            searchValue={serviceSearchValue}
            totalItems={filteredServices.length}
          />
        </div>
      </Modal>

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={closeLocationModal} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              isLoading={isSavingLocation}
              onClick={() => void submitLocation()}
              type="button"
            >
              <Save className="h-4 w-4" />
              {editingLocation ? "Save Changes" : "Create Location"}
            </Button>
          </div>
        }
        onClose={closeLocationModal}
        open={locationModalDisclosure.isOpen}
        title={editingLocation ? "Edit Location" : "Add Location"}
      >
        <div className="field-grid">
          <FormField
            error={locationForm.formState.errors.city_name?.message}
            label="City Name"
            required
          >
            <Input
              {...locationForm.register("city_name")}
              placeholder="Hyderabad"
            />
          </FormField>

          <FormField
            error={locationForm.formState.errors.short_code?.message}
            label="Short Code"
            required
          >
            <Input
              {...locationForm.register("short_code")}
              maxLength={3}
              placeholder="HYD"
            />
          </FormField>

          <FormField
            className="md:col-span-2"
            error={locationForm.formState.errors.subtitle?.message}
            label="Subtitle"
            required
          >
            <Input
              {...locationForm.register("subtitle")}
              placeholder="Laboratory Equipment & Water Plants"
            />
          </FormField>

          <FormField
            error={locationForm.formState.errors.state_id?.message}
            label="State"
            required
          >
            <Select
              {...locationForm.register("state_id", { valueAsNumber: true })}
            >
              <option value="">Select a state</option>
              {stateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            error={locationForm.formState.errors.display_order?.message}
            label="Display Order"
            required
          >
            <Input
              {...locationForm.register("display_order", {
                valueAsNumber: true,
              })}
              min={1}
              type="number"
            />
          </FormField>

          <FormField
            description="Inactive locations stay hidden on the homepage map labels."
            label="Is Active"
          >
            <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
              <Switch
                checked={Boolean(locationForm.watch("is_active"))}
                onChange={(checked) =>
                  locationForm.setValue("is_active", checked, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </FormField>
        </div>
      </Modal>

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={closeStatModal} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              isLoading={isSavingStat}
              onClick={() => void submitStat()}
              type="button"
            >
              <Save className="h-4 w-4" />
              {editingStat ? "Save Changes" : "Create Stat"}
            </Button>
          </div>
        }
        onClose={closeStatModal}
        open={statModalDisclosure.isOpen}
        title={editingStat ? "Edit Stat" : "Add Stat"}
      >
        <div className="field-grid">
          <FormField
            error={statForm.formState.errors.stat_key?.message}
            label="Stat Key"
            required
          >
            <Input
              {...statForm.register("stat_key")}
              placeholder="total_installations"
            />
          </FormField>

          <FormField
            error={statForm.formState.errors.stat_value?.message}
            label="Stat Value"
            required
          >
            <Input {...statForm.register("stat_value")} placeholder="150+" />
          </FormField>

          <FormField
            className="md:col-span-2"
            error={statForm.formState.errors.stat_label?.message}
            label="Stat Label"
            required
          >
            <Input
              {...statForm.register("stat_label")}
              placeholder="Total Installations"
            />
          </FormField>

          <FormField
            error={statForm.formState.errors.display_order?.message}
            label="Display Order"
            required
          >
            <Input
              {...statForm.register("display_order", { valueAsNumber: true })}
              min={1}
              type="number"
            />
          </FormField>

          <FormField
            description="Inactive stats stay hidden on the homepage."
            label="Is Active"
          >
            <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
              <Switch
                checked={Boolean(statForm.watch("is_active"))}
                onChange={(checked) =>
                  statForm.setValue("is_active", checked, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        confirmLabel={`Delete ${deleteTarget?.entity ?? "item"}`}
        description={`This will permanently delete "${deleteTarget?.label ?? "this item"}".`}
        isLoading={
          isSavingState || isSavingService || isSavingLocation || isSavingStat
        }
        onClose={() => {
          deleteDisclosure.close();
          setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
        open={deleteDisclosure.isOpen}
        title="Delete item?"
      />

      <JSONPreviewDrawer
        data={rawData}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Nationwide Presence API Response"
      />
    </>
  );
};
