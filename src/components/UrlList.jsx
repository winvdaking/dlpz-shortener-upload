import { useState, useEffect } from "react";
import { getAllUrls } from "../config/api";
import { useAlert } from "../contexts/AlertContext";
import UrlItem from "./UrlItem";
import UrlDetailsModal from "./UrlDetailsModal";

const UrlList = () => {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showError } = useAlert();

  const loadUrls = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUrls();
      setUrls(response.urls || []);
    } catch (error) {
      showError("Erreur lors du chargement des URLs");
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDetails = (url) => {
    setSelectedUrl(url);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUrl(null);
  };

  useEffect(() => {
    loadUrls();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des URLs...</p>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Aucune URL raccourcie pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vos URLs raccourcies
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {urls.length} URL{urls.length > 1 ? "s" : ""} raccourcie{urls.length > 1 ? "s" : ""}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {urls.map((url) => (
          <UrlItem
            key={url.code}
            url={url}
            onShowDetails={handleShowDetails}
          />
        ))}
      </div>

      <UrlDetailsModal
        url={selectedUrl}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default UrlList;
