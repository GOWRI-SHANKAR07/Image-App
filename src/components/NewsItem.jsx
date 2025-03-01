import {
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ms } from "react-native-size-matters";
import { Colors } from "../utils/Colors";
import RNFS from "react-native-fs";
import dayjs from "dayjs";

const NewsItem = ({ item }) => {
  const [localImagePath, setLocalImagePath] = useState("");

  useEffect(() => {
    checkLocalStorage();
  }, []);

  const getImageFileName = (imageUrl, itemId) => {
    const extension = imageUrl.split(".").pop().split("?")[0] || "jpg";
    return `news_image_${itemId}.${extension}`;
  };

  const checkLocalStorage = async () => {
    if (!item?.urlToImage || !item?.title) return;

    try {
      const itemId =
        item.id ||
        encodeURIComponent(item.title).replace(/\W/g, "").substring(0, 20);

      const filename = getImageFileName(item.urlToImage, itemId);
      const downloadPath = `${RNFS.DownloadDirectoryPath}/${filename}`;

      const exists = await RNFS.exists(downloadPath);
      if (exists) {
        setLocalImagePath(downloadPath);
      }
    } catch (error) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
    }
  };

  const handleOpenNews = async (url) => {
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch (error) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
    }
  };

  const downloadImage = async (imageUrl) => {
    if (Platform.OS !== "android") {
      return null;
    }

    if (!imageUrl || !item?.title) return;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to storage to save images",
          buttonPositive: "OK",
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show("Storage permission denied", ToastAndroid.SHORT);
        return null;
      }

      const itemId =
        item.id ||
        encodeURIComponent(item.title).replace(/\W/g, "").substring(0, 20);
      const filename = getImageFileName(imageUrl, itemId);

      const downloadPath = `${RNFS.DownloadDirectoryPath}/${filename}`;

      const exists = await RNFS.exists(downloadPath);
      if (exists) {
        ToastAndroid.show("Image already downloaded", ToastAndroid.SHORT);
        setLocalImagePath(downloadPath);
        return downloadPath;
      }

      ToastAndroid.show("Downloading image...", ToastAndroid.SHORT);

      const result = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: downloadPath,
        background: true,
      }).promise;

      if (result.statusCode === 200) {
        ToastAndroid.show("Image saved to Downloads folder", ToastAndroid.LONG);

        await RNFS.scanFile(downloadPath);

        setLocalImagePath(downloadPath);

        return downloadPath;
      } else {
        ToastAndroid.show("Download failed", ToastAndroid.SHORT);
        return null;
      }
    } catch (error) {
      ToastAndroid.show(
        "Download failed: " + error.message,
        ToastAndroid.SHORT
      );
      return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handleOpenNews(item?.url)}
    >
      <Text style={styles.sourceTxt}>Source: {item?.source?.name}</Text>
      <Text style={styles.sourceTxt}>Author: {item?.author}</Text>
      <Text style={styles.titleTxt}>{item?.title}</Text>
      <Text style={styles.description}>{item?.description}</Text>
      <Text style={styles.sourceTxt}>
        Published at {dayjs(item?.publishedAt).format("DD MMM YYYY, hh:mm A")}
      </Text>
      <TouchableOpacity onPress={() => downloadImage(item?.urlToImage)}>
        <Image
          source={{
            uri: localImagePath
              ? `file://${localImagePath}`
              : item?.urlToImage ||
                "https://archive.org/download/placeholder-image//placeholder-image.jpg",
          }}
          style={styles.img}
        />
        <Text style={styles.downloadText}>
          {localImagePath ? "Downloaded" : "Tap to download"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default NewsItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    width: "95%",
    padding: ms(10),
    marginVertical: ms(10),
    alignSelf: "center",
    borderRadius: 10,
    elevation: 10,
  },

  sourceTxt: {
    fontSize: ms(14),
    color: Colors.black,
    marginVertical: ms(2),
  },

  titleTxt: {
    fontSize: ms(18),
    fontWeight: "bold",
    color: Colors.black,
    marginVertical: ms(5),
  },

  description: {
    fontSize: ms(16),
    fontWeight: "500",
    color: Colors.black,
    marginBottom: ms(10),
    textAlign: "justify",
    lineHeight: 25,
  },

  img: {
    width: "100%",
    height: ms(200),
    marginVertical: ms(5),
    borderRadius: 10,
  },

  downloadText: {
    position: "absolute",
    bottom: ms(10),
    right: ms(10),
    color: Colors.white,
    padding: ms(5),
    borderRadius: 5,
  },
});
