import { Box, Text, Flex, Image } from "@chakra-ui/react";
import React from "react";
function MessageBox({ messages }) {
  return (
    <Box
      borderWidth={"1px"}
      mt="10px"
      padding={"10px"}
      overflowY={"auto"}
      maxW={"450px"}
    >
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message.role}`}
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {message.role === "user" ? (
            <Flex justifyContent={"flex-end"}>
              <Text fontSize="14px" mr="12px">
                {message.content}
              </Text>
              <Image
                src="/image/user.png"
                w="43px"
                h="40px"
                justifyContent={"center"}
              />
            </Flex>
          ) : (
            <Flex>
              <Image
                src="/image/doctor2.png"
                w="43px"
                h="40px"
                justifyContent={"center"}
                mr="12px"
              />
              <Text fontSize="14px">{message.content}</Text>
            </Flex>
          )}
        </div>
      ))}
    </Box>
  );
}

export default MessageBox;
