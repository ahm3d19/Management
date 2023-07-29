import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useAnimatedGestureHandler,
} from "react-native-reanimated";

const TaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  const translateY = useSharedValue(0);
  const taskRefs = useRef(tasks.map(() => React.createRef()));

  const fadeInUp = () => {
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.exp),
    });
  };

  React.useEffect(() => {
    fadeInUp();
  }, []);

  const handleGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
      ctx.currentIndex = -1;
      ctx.startIndex = -1;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;

      // Calculate the index of the dragged task based on the position
      const offsetY = event.absoluteY - event.y;
      const currentIndex = Math.floor((offsetY + translateY.value + 32) / 64);

      if (ctx.currentIndex !== currentIndex) {
        if (ctx.currentIndex === -1) {
          // Capture the start index when the task is first picked up
          ctx.startIndex = currentIndex;
        }
        // Update the task order in the list while dragging
        const reorderedTasks = [...tasks];
        const taskToMove = reorderedTasks[ctx.startIndex];
        reorderedTasks.splice(ctx.startIndex, 1);
        reorderedTasks.splice(currentIndex, 0, taskToMove);
        tasks.splice(0, tasks.length, ...reorderedTasks);

        ctx.currentIndex = currentIndex;
      }
    },
    onEnd: () => {
      // Snap back the dragged task to its original position after dragging
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={styles.container}>
      {tasks.map((task, index) => (
        <PanGestureHandler
          key={task.id}
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureEvent}
        >
          <Animated.View
            ref={taskRefs.current[index]}
            style={[styles.taskItem, animatedStyle]}
          >
            <TouchableOpacity onPress={() => onToggleTask(task.id)}>
              <View
                style={[
                  styles.checkbox,
                  task.completed && styles.completedCheckbox,
                ]}
              >
                {task.completed && <View style={styles.checkmark} />}
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{task.title}</Text>
              <Text>{task.description}</Text>
            </View>
            <TouchableOpacity onPress={() => onDeleteTask(task.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    minHeight: 64, // Set a minimum height for the task item
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  completedCheckbox: {
    backgroundColor: "#000",
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  title: {
    fontWeight: "bold",
  },
  deleteButton: {
    color: "red",
    marginLeft: 8,
  },
});

export default TaskList;
