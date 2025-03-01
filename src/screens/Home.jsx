import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { getHeadlines } from "../services/AppApi";
import NewsItem from "../components/NewsItem";
import { FlashList } from "@shopify/flash-list";
import { ms, s } from "react-native-size-matters";
import { Colors } from "../utils/Colors";

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const getNews = useCallback(
    async (isLoadMore = false) => {
      try {
        if (!isLoadMore) setLoading(true);
        else setLoadingMore(true);

        const response = await getHeadlines(page);

        if (response?.success) {
          setData((prevData) =>
            isLoadMore
              ? [...prevData, ...response.success.articles]
              : response.success.articles
          );
        }
      } catch (error) {
        ToastAndroid.show(error, ToastAndroid.SHORT);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [page]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    getNews(false);
  }, [getNews]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [loadingMore]);

  useEffect(() => {
    getNews(page > 1);
  }, [page]);

  const keyExtractor = useCallback((item) => {
    return item.url || item.title || Math.random().toString();
  }, []);

  const renderItem = useCallback(({ item }) => {
    return <NewsItem item={item} />;
  }, []);

  const renderHeader = useCallback(() => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>Top Headlines</Text>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={300}
          initialScrollIndex={0}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: ms(10),
    paddingTop: ms(10),
    width: "100%",
    height: "100%",
  },

  header: {
    width: "100%",
    height: s(60),
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: s(10),
  },

  headerText: {
    fontSize: ms(22),
    fontWeight: "bold",
    color: Colors.black,
  },

  listContent: {
    paddingBottom: ms(20),
  },
});

export default Home;
