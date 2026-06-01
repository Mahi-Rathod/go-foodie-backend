--
-- PostgreSQL database dump
--

\restrict zAkBI8WMAK5KmlKNQvMlOriUh9jyrICffJysNC9zhVqeV5LJi0yvanbEeL17OP5

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ADRESS_LABLE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ADRESS_LABLE" AS ENUM (
    'HOME',
    'WORK',
    'OTHER'
);


ALTER TYPE public."ADRESS_LABLE" OWNER TO postgres;

--
-- Name: OTP_PURPOSE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OTP_PURPOSE" AS ENUM (
    'REGISTER',
    'LOGIN',
    'RESET_PASSWORD',
    'DELETE_ACCOUNT'
);


ALTER TYPE public."OTP_PURPOSE" OWNER TO postgres;

--
-- Name: ROLE; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ROLE" AS ENUM (
    'USER',
    'ADMIN',
    'DELIVERY',
    'RESTAURANT'
);


ALTER TYPE public."ROLE" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    label public."ADRESS_LABLE" NOT NULL,
    "fullAdress" text NOT NULL,
    landmark text,
    city text NOT NULL,
    state text NOT NULL,
    "pinCode" text NOT NULL,
    country text NOT NULL,
    latitude double precision,
    longitude double precision,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: OtpCodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OtpCodes" (
    id text NOT NULL,
    identifier text NOT NULL,
    purpose public."OTP_PURPOSE" NOT NULL,
    otp_hash text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "userId" text
);


ALTER TABLE public."OtpCodes" OWNER TO postgres;

--
-- Name: Restaurant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Restaurant" (
    id text NOT NULL,
    name text NOT NULL,
    "ownerId" text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    "pinCode" text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "isOpen" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Restaurant" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "tokenId" text NOT NULL,
    "userId" text NOT NULL,
    "refreshToken" text NOT NULL,
    "userAgent" text,
    "ipAddress" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    mobile text NOT NULL,
    password text NOT NULL,
    role public."ROLE" DEFAULT 'USER'::public."ROLE" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: OtpCodes OtpCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpCodes"
    ADD CONSTRAINT "OtpCodes_pkey" PRIMARY KEY (id);


--
-- Name: Restaurant Restaurant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Restaurant"
    ADD CONSTRAINT "Restaurant_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: OtpCodes_identifier_purpose_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OtpCodes_identifier_purpose_idx" ON public."OtpCodes" USING btree (identifier, purpose);


--
-- Name: Restaurant_ownerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Restaurant_ownerId_key" ON public."Restaurant" USING btree ("ownerId");


--
-- Name: Session_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_refreshToken_key" ON public."Session" USING btree ("refreshToken");


--
-- Name: Session_tokenId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_tokenId_key" ON public."Session" USING btree ("tokenId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_mobile_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_mobile_key" ON public."User" USING btree (mobile);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OtpCodes OtpCodes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OtpCodes"
    ADD CONSTRAINT "OtpCodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Restaurant Restaurant_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Restaurant"
    ADD CONSTRAINT "Restaurant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict zAkBI8WMAK5KmlKNQvMlOriUh9jyrICffJysNC9zhVqeV5LJi0yvanbEeL17OP5

