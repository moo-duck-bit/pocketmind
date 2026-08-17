import React from "react";
import { Box, Text, Flex, Image, Button, useSize } from "@chakra-ui/react";
import { ColorSigniture } from "../../utils/_Palette";
import { WecomeText1, WecomeText2 } from "../../utils/_Text";
function NoDiary() {
  return (
    <Box minH={"calc(100vh - 130px)"} alignContent="center" mx="12px">
      <Flex flexDir="column" backgroundColor={"white"} mx="12px">
        <Text mt="20px" fontSize={"24px"} fontWeight={"700"} mb="5px">
          안녕하세요 😀
        </Text>
        <Text fontSize={"20px"} fontWeight={"400"}>
          {" "}
          Pocket Mind에 오신걸 환영합니다.
        </Text>
        <Flex alignItems={"center"} justifyContent={"center"} my="30px">
          {" "}
          <Image
            src="/image/diary.png"
            w="198px"
            h="206px"
            justifyContent={"center"}
          />
        </Flex>
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          textAlign={"center"}
          my="30px"
        >
          <Button
            backgroundColor={ColorSigniture}
            color={"white"}
            w="100%"
            h="43px"
            borderRadius="20px"
            textAlign={"center"}
          >
            Journaling Today
          </Button>
        </Flex>

        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          textAlign={"center"}
        >
          <Text> 🥲 아직 작성한 일기가 없어요. 첫 일기를 작성해볼까요?</Text>
        </Flex>
      </Flex>
    </Box>
  );
}

export default NoDiary;
