import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useComments } from '@/contexts/CommentsContext';
import { UsernameModal } from './UsernameModal';
import { getCommentsConfig } from '@/config/commentsConfig';

interface CommentsSectionProps {
  cityName: string;
  cityCoords?: { lat: number; lng: number };
}

export function CommentsSection({ cityName, cityCoords }: CommentsSectionProps) {
  const { comments, nearbyComments, username, setUsername, addComment, loadCommentsForCity, loading } = useComments();
  const [commentText, setCommentText] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNearbyComments, setShowNearbyComments] = useState(true);
  const [showLocalComments, setShowLocalComments] = useState(true);

  // Load comments for this city and nearby cities
  useEffect(() => {
    loadCommentsForCity(cityName, cityCoords);
  }, [cityName, cityCoords, loadCommentsForCity]);

  const handleSubmitComment = async () => {
    if (!username) {
      setShowUsernameModal(true);
      return;
    }

    const trimmed = commentText.trim();
    if (trimmed.length < 5) {
      Alert.alert('Error', 'Comment must be at least 5 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(cityName, trimmed);
      setCommentText('');
      Alert.alert('Success', 'Comment posted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameSubmit = async (newUsername: string) => {
    try {
      await setUsername(newUsername);
      setShowUsernameModal(false);
      Alert.alert('Success', `Username set to: ${newUsername}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save username. Please try again.');
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderComment = ({ item }: { item: any }) => (
    <View style={[
      styles.commentCard,
      item.isNearby && styles.nearbyCommentCard
    ]}>
      <View style={styles.commentHeader}>
        <View style={styles.usernameBadge}>
          <Text style={styles.usernameIcon}>👤</Text>
          <Text style={styles.commentUsername}>{item.username}</Text>
          {item.isNearby && (
            <View style={styles.nearbyBadge}>
              <Text style={styles.nearbyBadgeText}>📍</Text>
            </View>
          )}
        </View>
        <Text style={styles.commentTimestamp}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      {item.isNearby && item.nearbyCityInfo && (
        <View style={styles.nearbyCityInfo}>
          <Text style={styles.nearbyCityText}>
            From {item.nearbyCityInfo.description}
          </Text>
        </View>
      )}
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>💬</Text>
          <Text style={styles.headerTitle}>Community Health Reports</Text>
        </View>
        {username && (
          <TouchableOpacity
            style={styles.changeUsernameButton}
            onPress={() => setShowUsernameModal(true)}
          >
            <Text style={styles.changeUsernameText}>@{username}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.description}>
        Share observations about the health and wellness of this area
      </Text>

      {/* Comment Filter Controls */}
      <View style={styles.filterControls}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, showLocalComments && styles.filterButtonActive]}
            onPress={() => setShowLocalComments(!showLocalComments)}
          >
            <Text style={[styles.filterButtonText, showLocalComments && styles.filterButtonTextActive]}>
              📍 {cityName} ({comments.length})
            </Text>
          </TouchableOpacity>
          
          {nearbyComments.length > 0 && (
            <TouchableOpacity
              style={[styles.filterButton, showNearbyComments && styles.filterButtonActive]}
              onPress={() => setShowNearbyComments(!showNearbyComments)}
            >
              <Text style={[styles.filterButtonText, showNearbyComments && styles.filterButtonTextActive]}>
                🌍 Nearby ({nearbyComments.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Comment Input */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
          placeholder={
            username
              ? 'Share your health observations...'
              : 'Set username to post comments'
          }
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
          maxLength={500}
          editable={!isSubmitting}
        />

        <View style={styles.inputFooter}>
          <Text style={styles.charCount}>
            {commentText.length}/500
          </Text>

          {!username ? (
            <TouchableOpacity
              style={styles.setUsernameButton}
              onPress={() => setShowUsernameModal(true)}
            >
              <Text style={styles.setUsernameButtonText}>Set Username</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.postButton,
                (isSubmitting || commentText.trim().length < 5) &&
                  styles.postButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={isSubmitting || commentText.trim().length < 5}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Local Comments */}
      {showLocalComments && (
        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>
            {cityName} Comments ({comments.length})
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#00FF88" />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to share your observations!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.commentsList}
            />
          )}
        </View>
      )}

      {/* Nearby City Comments */}
      {nearbyComments.length > 0 && showNearbyComments && (
        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>
            📍 Nearby City Comments ({nearbyComments.length})
          </Text>
          <Text style={styles.nearbyDescription}>
            Comments from cities within {getCommentsConfig().maxProximityMiles} miles
          </Text>
          <FlatList
            data={nearbyComments}
            renderItem={renderComment}
            keyExtractor={(item) => `nearby-${item.id}`}
            scrollEnabled={false}
            contentContainerStyle={styles.commentsList}
          />
        </View>
      )}

      {/* Username Modal */}
      <UsernameModal
        visible={showUsernameModal}
        onSubmit={handleUsernameSubmit}
        onCancel={() => setShowUsernameModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changeUsernameButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  changeUsernameText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 20,
  },
  inputSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  input: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#666666',
  },
  setUsernameButton: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  setUsernameButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  postButton: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#2A2A2A',
    opacity: 0.5,
  },
  postButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsSectionTitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  commentsList: {
    gap: 12,
  },
  commentCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderLeftWidth: 3,
    borderLeftColor: '#00FF88',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usernameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  usernameIcon: {
    fontSize: 14,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FF88',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666666',
  },
  commentText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    color: '#888888',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  nearbyCommentCard: {
    borderLeftColor: '#FFA500',
    backgroundColor: '#1A1A0A',
  },
  nearbyBadge: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  nearbyBadgeText: {
    fontSize: 10,
    color: '#000000',
  },
  nearbyCityInfo: {
    backgroundColor: '#2A2A1A',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  nearbyCityText: {
    fontSize: 12,
    color: '#FFA500',
    fontWeight: '600',
  },
  nearbyDescription: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  filterControls: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  filterButtonActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  filterButtonText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#000000',
  },
});

